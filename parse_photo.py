from __future__ import print_function

import boto3
import json
import logging
import os
import urllib
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError

from datetime import datetime
from dateutil import tz

logger = logging.getLogger()
logger.setLevel(logging.INFO)

region_name=os.environ['AWS_REGION']

dynamodb = boto3.resource('dynamodb', region_name)
photos_table = dynamodb.Table('owasp10-demo-Photos')
tags_table = dynamodb.Table('owasp10-demo-Tags')
photo_tags_table = dynamodb.Table('owasp10-demo-PhotosTags')

rekognition = boto3.client("rekognition", region_name)

def write_image_meta(file_object, bucket_object, event_time):
    response = photos_table.put_item(
        Item={
            'photo_id': file_object['key'],
            'upload_date': event_time,
            'bucket': bucket_object['name'],
            }
    )

def write_image_tags(file_object, bucket_object, labels):
    for x in labels["Labels"]:
        response = tags_table.put_item(
            Item={
                'tag': x['Name'],
            }
        )
        response = photo_tags_table.put_item(
            Item={
                'photo_id': file_object['key'],
                'tag_id': x['Name'],
                'confidence': int(x['Confidence'])
            }
        )


def detect_labels(key, bucket, max_labels=10, min_confidence=80):
    logger.info(key)
    logger.info(bucket)
    response = rekognition.detect_labels(
        Image={
            "S3Object": {
                "Bucket": bucket,
                "Name": key,
            }
        },
        MaxLabels=max_labels,
        MinConfidence=min_confidence,
    )

    return response

def image_moderation (key, bucket, min_confidence=40):
    response = rekognition.detect_moderation_labels(
        Image={
            "S3Object": {
                "Bucket": bucket,
                "Name": key,
            }
        },
        MinConfidence=min_confidence,
    )
    return response

def run_reko(event, context):
    logger.info('Event Data: ' + json.dumps(event))

    file_object = event['Records'][0]['s3']['object']
    file_key = urllib.parse.unquote_plus(file_object['key'], encoding ='utf8')
    bucket_object = event['Records'][0]['s3']['bucket']
    event_time = event['Records'][0]['eventTime']

    moderation = image_moderation(file_key, bucket_object['name'])

    if moderation['ModerationLabels']:
        logger.info('Moderation Failed: ' + json.dumps(moderation))
        logger.info('Deleting Object: ' + bucket_object['name'] + '/' + file_key)
        client = boto3.client('s3')
        response = client.delete_object(
            Bucket=bucket_object['name'],
            Key=file_key
            )
        logger.info(response)
    else:
        labels = detect_labels(file_key, bucket_object['name'])
        write_image_meta(file_object, bucket_object, event_time)
        write_image_tags(file_object, bucket_object, labels)
        logger.info('Reko Labels: ' + json.dumps(labels))
