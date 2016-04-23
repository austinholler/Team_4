# loadCacheSampleData.py
# Created by: Matt Bubernak

# Edit History
# Date    Author   Description
# =====================================================================
# 4/17    MB       Allows you to locally populate redis. 

import os, json
from boto import dynamodb2
from boto.dynamodb2.table import Table
from decimal import Decimal
import datetime as DT
import sys
import re
import redis
import random

# Info for today. 
today = DT.date.today()
todayYear = (today).strftime("%Y")
todayDay = (today).strftime("%d")
todayMonth = (today).strftime("%m")

#AWS Connection String
REGION = "us-west-2"

# Read secret data
keyFile = open('secret.txt', 'r')
aws_access = keyFile.readline().rstrip()
aws_access_secret = keyFile.readline().rstrip()

# Connect to the database
conn = dynamodb2.connect_to_region(
REGION,
aws_access_key_id=aws_access,
aws_secret_access_key=aws_access_secret,
is_secure = False,
)

# Master list of categories. 
CATEGORY_LIST = ['new-age-spirituality','sci-fi-fantasy', 'socializing', 'outdoors-adventure', 'career-business',
    'singles', 'government-politics', 'sports-recreation', 'tech', 'lifestyle','health-wellbeing', 'food-drink',
    'education-learning', 'music', 'arts-culture', 'cars-motorcycles', 'community-environment', 'hobbies-crafts',
    'dancing', 'religion-beliefs', 'language', 'games', 'parents-family', 'fitness', 'lgbt', 'writing', 'fashion-beauty',
    'photography', 'support', 'movies-film', 'pets-animals'];

# Sample cities. 
CITYLIST = ['DEN','ORD','HOU','CHI']

# Month list.
MONTHLIST = ["01","02","03","04","05","06","07","08","09","10","11","12"]


def loadDataRedis (sourceHash):
	r = redis.StrictRedis(host='localhost', port=6379, db=0)
	for key in sourceHash.keys():
		if sourceHash[key]:
			print(key)
			sys.stdout.flush()
			r.hmset(key,sourceHash[key])
	return

def populateSampleData ():
	masterHash = {}

	for city in CITYLIST: 
		for category in CATEGORY_LIST: 
			entryYear = "2016"
			for entryMonth in MONTHLIST:
				codes = ['TOP-ALL', 'TOP-ALL'+entryYear, 'TOP-ALL'+entryYear+entryMonth, 'TOP-ALL'+entryYear+entryMonth+'23']
				for curCode in codes:
						if curCode not in masterHash: masterHash[curCode]={}
						if category not in masterHash[curCode]: 
							masterHash[curCode][category] = random.uniform(0, 1)
						else: 
					 		masterHash[curCode][category] += random.uniform(0, 1)
				codes = ["CAT-"+'ALL', "CAT-"+'ALL'+entryYear,"CAT-"+'ALL'+entryYear+entryMonth, "CAT-"+'ALL'+entryYear+entryMonth+'23']
				for curCode in codes:
					if curCode not in masterHash: 
						masterHash[curCode]={}
					if category not in masterHash[curCode]: 
						masterHash[curCode][category] = random.uniform(0, 1)
					else: 
						masterHash[curCode][category] += random.uniform(0, 1)
				codes = ['TOP-'+city, 'TOP-'+city+entryYear, 'TOP-'+city+entryYear+entryMonth, 'TOP-'+city+entryYear+entryMonth+'23']
				for curCode in codes:
						if curCode not in masterHash: masterHash[curCode]={}
						if category not in masterHash[curCode]: 
							masterHash[curCode][category] = random.uniform(0, 1)
						else: 
					 		masterHash[curCode][category] += random.uniform(0, 1)
				codes = ["CAT-"+city, "CAT-"+city+entryYear, "CAT-"+city+entryYear+entryMonth,"CAT-"+city+entryYear+entryMonth+'23']
				for curCode in codes:
					if curCode not in masterHash: 
						masterHash[curCode]={}
					if category not in masterHash[curCode]: 
						masterHash[curCode][category] = random.uniform(0, 1)
					else: 
						masterHash[curCode][category] += random.uniform(0, 1)
				

	print("Loading data for: ALL into redis")
	loadDataRedis(masterHash)

def main(): 
	print("flushing redis")
	r = redis.StrictRedis(host='localhost', port=6379, db=0)
	r.flushdb()
	print("Load Cache History")
	print("==================")

	print("Loading Sample Data for cities...")
	sys.stdout.flush()
	populateSampleData()

main()

