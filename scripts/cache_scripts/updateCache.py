# loadCache.py
# Created by: Matt Bubernak

# Edit History
# Date    Author   Description
# =====================================================================
# 4/16    MB       Creation

import os, json
from boto import dynamodb2
from boto.dynamodb2.table import Table
from decimal import Decimal
import datetime as DT
import sys
import re
import redis

#AWS Connection String
REGION = "us-west-2"

# Read secret data
keyFile = open('secret.txt', 'r')
aws_access = keyFile.readline().rstrip()
aws_access_secret = keyFile.readline().rstrip()

# Info for today. 
todayYear = (today).strftime("%Y")
todayDay = (today).strftime("%d")
todayMonth = (today).strftime("%m")


conn = dynamodb2.connect_to_region(
    REGION,
    aws_access_key_id=aws_access,
    aws_secret_access_key=aws_access_secret,
    is_secure = False,
)

CATEGORY_LIST = ['new-age-spirituality', 'sci-fi-fantasy', 'socializing', 'outdoors-adventure', 'career-business',
    'singles', 'government-politics', 'sports-recreation', 'tech', 'lifestyle','health-wellbeing', 'food-drink',
    'education-learning', 'music', 'arts-culture', 'cars-motorcycles', 'community-environment', 'hobbies-crafts',
    'dancing', 'religion-beliefs', 'language', 'games', 'parents-family', 'fitness', 'lgbt', 'writing', 'fashion-beauty',
    'photography', 'support', 'movies-film', 'pets-animals'];

# Default load w/ junk dataa
masterHash = {'HOU':{'football':3,'soccer':2,'baseball':.5,'bla':1,
'bl2a':1.2,'bl2a':.1,'bl23a':.3,'bl2a':1},
'PDX':{'football':3,'soccer':2,'baseball':.5,'bla':1,
'bl2a':1.2,'bl2a':.1,'bl23a':.3,'bl2a':1}}





