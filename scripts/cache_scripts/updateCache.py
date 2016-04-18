# loadCache.py
# Created by: Matt Bubernak

# Edit History
# Date    Author   Description
# =====================================================================
# 4/16    MB       Creation
# 4/17    MB       Support for daily query and update. 
# 4/17    MB       Support for update of previous redis entries. 
# 4/17    MB       Removed redundant connection to redis. 
# 4/17    MB       Spport for prod mode. 

import os, json
from boto import dynamodb2
from boto.dynamodb2.table import Table
from decimal import Decimal
import datetime as DT
import sys
import re
import redis
from decimal import *

PRODMODE = True
CACHEURL = 'citypulse-cache.ci54cw.0001.usw2.cache.amazonaws.com'

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


# Use cities table first. 
cities = Table(
    "Cities",
    connection=conn
)

# Get the name of all cities. 
cityList = cities.scan()

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


# Decide which cache to connect to. 
if PRODMODE == True: 
	hostURL = 'localhost'
else PRODMODE: 
	hostURL = CACHEURL
r = redis.StrictRedis(host=hostURL, port=6379, db=0)


def populateCacheToday ():
	print("Inside populateTopicHash")
	masterHash = {}

	# Switch to topics table
	topics = Table(
	    "Topics",
	    connection=conn
	)
	sys.stdout.flush()
	
	for city in cityList:
		
		# New nested hash for this city.

		# We want to query for just TODAY from this data point. 
		code = city['code'] + todayYear + todayMonth + todayDay
		masterHash[code] = {}

		print("Querying all categories for:" + code + '\n')
		for category in CATEGORY_LIST:
			print("Querying for category:" + category + '\n')
			sys.stdout.flush()

			topicsData = topics.query(index='Categories',
				Category__eq=category,
				Date__beginswith=code)
			print("Recieved data back.")
			sys.stdout.flush()
			for dataPoint in topicsData:
				entryYear = dataPoint['Date'][3:][:-4]
				entryMonth = dataPoint['Date'][7:][:-2]
				entryDay = dataPoint['Date'][9:]
				
				# Populate the topic hash.
				curCode = "TOP-"+code
				if curCode not in masterHash: 
					masterHash[curCode]={}
				if dataPoint['Name'] not in masterHash[curCode]: 
					masterHash[curCode][dataPoint['Name']] = dataPoint['Score']
				else: 
					masterHash[curCode][dataPoint['Name']] += dataPoint['Score']
				
				# Populate the category hash. 
				curCode = "CAT-"+code
				if curCode not in masterHash: 
					masterHash[curCode]={}
				if category not in masterHash[curCode]: 
					masterHash[curCode][category] = dataPoint['Score']
				else: 
					masterHash[curCode][category] += dataPoint['Score']
				
				# Populate the ALL topic hash. 
				curCode = "TOP-"+'ALL'+entryYear+entryMonth+entryDay
				if curCode not in masterHash: masterHash[curCode]={}
				if dataPoint['Name'] not in masterHash[curCode]: 
					masterHash[curCode][dataPoint['Name']] = dataPoint['Score']
				else: 
			 		masterHash[curCode][dataPoint['Name']] += dataPoint['Score']

			 	# Populate the ALL category hash. 
				curCode = "CAT-"+'ALL'+entryYear+entryMonth+entryDay
			 	if curCode not in masterHash: 
						masterHash[curCode]={}
				if category not in masterHash[curCode]: 
					masterHash[curCode][category] = dataPoint['Score']
				else: 
					masterHash[curCode][category] += dataPoint['Score']
	
	# Load these daily entries into redis. 
	loadDataRedis(masterHash)
	# Update any existing year/month entries. 
	updateRedisEntries(masterHash)

# Creates new entries for all of the objects in our hash. 
def loadDataRedis (sourceHash):
	for key in sourceHash.keys():
		if sourceHash[key]:
			print(key)
			sys.stdout.flush()
			r.hmset(key,sourceHash[key])
	return

# Updates the existing month/year entries based on today's data. 
def updateRedisEntries (sourceHash): 
	print("Updating existing entries in redis")

	for key in sourceHash: 
		monthKey = key[:-2]
		yearKey = key[:-4]
		codeKey = key[:-8]

		for innerKey in sourceHash[key]:

			# Month update
			curScore = r.hget(monthKey,innerKey)
			# If this entry doesn't exist in the current key, add it. 
			if (curScore == None):
				#print ("No entry for:" + innerKey + " in: " + monthKey + " so creating new one. ")
				r.hset(monthKey,innerKey,sourceHash[key][innerKey])
			# If this entry does exist in the current key, update it. 
			else: 
				#print ("Entry found for:" + innerKey + " in: " + monthKey + " so updating it. ")
				r.hset(monthKey,innerKey,Decimal(curScore) + sourceHash[key][innerKey])

			# Year update
			curScore = r.hget(yearKey,innerKey)
			# If this entry doesn't exist in the current key, add it. 
			if (curScore == None):
				print ("No entry for:" + innerKey + " in: " + yearKey + " so creating new one. ")
				r.hset(yearKey,innerKey,sourceHash[key][innerKey])
			# If this entry does exist in the current key, update it. 
			else: 
				print ("Entry found for:" + innerKey + " in: " + yearKey + " so updating it. ")
				r.hset(yearKey,innerKey,Decimal(curScore) + sourceHash[key][innerKey])

			# History update
			curScore = r.hget(codeKey,innerKey)
			# If this entry doesn't exist in the current key, add it. 
			if (curScore == None):
				print ("No entry for:" + innerKey + " in: " + codeKey + " so creating new one. ")
				r.hset(codeKey,innerKey,sourceHash[key][innerKey])
			# If this entry does exist in the current key, update it. 
			else: 
				print ("Entry found for:" + innerKey + " in: " + codeKey + " so updating it. ")
				r.hset(codeKey,innerKey,Decimal(curScore) + sourceHash[key][innerKey])


def main(): 
	print("Load Cache Today")
	print("==================")

	print("Loading Topic Data for today")
	populateCacheToday()


main()