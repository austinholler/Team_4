# loadCache.py
# Created by: Matt Bubernak

# Edit History
# Date    Author   Description
# =====================================================================
# 4/9     MB       File Creation
# 4/10    MB       Supports 'all' cache entries. 
# 4/10    MB       Read keys from secret file. 

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

def getDataWeek ():
	masterHash = {}

	# Get start/end date. 
	today = DT.date.today()
	start = (today - DT.timedelta(days=7)).strftime("%Y%m%d")
	end = (today).strftime("%Y%m%d")
	
	# Use cities table first. 
	cities = Table(
	    "Cities",
	    connection=conn
	)

	# Get the name of all cities. 
	data = cities.scan()

	# Switch to topics table
	topics = Table(
	    "Topics",
	    connection=conn
	)
	
	# Scan data for each city and add it to a hash. 
	print("Start:" + start + " End: " + end)
	# Add entry for "all"
	masterHash['ALL'] = {}

	for city in data:
		code = city['code'] 
		# New nested hash for this city.
		masterHash[code] = {}
		print("Querying all categories for:" + code)
		for category in CATEGORY_LIST:
			topicsData = topics.query(index='Categories',
				Category__eq=category,
				Date__between=[code+start,code+end])
			
			for dataPoint in topicsData:
				#print(dataPoint['Name']) 
				if dataPoint['Name'] not in masterHash[code]: 
					masterHash[code][dataPoint['Name']] = dataPoint['Score']
				else: 
					masterHash[code][dataPoint['Name']] += dataPoint['Score']

				# Also update the global cache: ALL
				if dataPoint['Name'] not in masterHash['ALL']: 
					masterHash['ALL'][dataPoint['Name']] = dataPoint['Score']
				else: 
					masterHash['ALL'][dataPoint['Name']] += dataPoint['Score']
	return masterHash

def loadDataRedis ():
	#print(masterHash)
	r = redis.StrictRedis(host='localhost', port=6379, db=0)
	for key in masterHash.keys():
		if masterHash[key]:
			print(key)
			r.hmset(key,masterHash[key])
		#for innerKey in masterHash[key].keys():
			#r.set(key+":"+innerKey,masterHash[key][innerKey])

masterHash = getDataWeek()
loadDataRedis()



