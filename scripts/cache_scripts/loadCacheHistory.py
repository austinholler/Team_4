# loadCache.py
# Created by: Matt Bubernak

# Edit History
# Date    Author   Description
# =====================================================================
# 4/9     MB       File Creation
# 4/10    MB       Supports 'all' cache entries. 
# 4/10    MB       Read keys from secret file. 
# 4/16    MB       Support for seperate topic/category queries. 
# 4/17    MB       For history, we now just add month/year data. 

import os, json
from boto import dynamodb2
from boto.dynamodb2.table import Table
from decimal import Decimal
import datetime as DT
import sys
import re
import redis


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

# Master list of categories. 
CATEGORY_LIST = ['new-age-spirituality','sci-fi-fantasy', 'socializing', 'outdoors-adventure', 'career-business',
    'singles', 'government-politics', 'sports-recreation', 'tech', 'lifestyle','health-wellbeing', 'food-drink',
    'education-learning', 'music', 'arts-culture', 'cars-motorcycles', 'community-environment', 'hobbies-crafts',
    'dancing', 'religion-beliefs', 'language', 'games', 'parents-family', 'fitness', 'lgbt', 'writing', 'fashion-beauty',
    'photography', 'support', 'movies-film', 'pets-animals'];

# Default load w/ junk dataa
masterTopicHash = {'HOU':{'football':3,'soccer':2}}
masterCategoryHash = {'HOU':{'football':3,'soccer':2}}

def populateCacheCities ():
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
		code = city['code'] 
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
				#entryDay = dataPoint['Date'][9:]
				
				# Populate the topic hash. 
				codes = ["TOP-"+code, "TOP-"+code+entryYear, "TOP-"+code+entryYear+entryMonth]
				for curCode in codes:
					if curCode not in masterHash: 
						masterHash[curCode]={}
					if dataPoint['Name'] not in masterHash[curCode]: 
						masterHash[curCode][dataPoint['Name']] = dataPoint['Score']
					else: 
						masterHash[curCode][dataPoint['Name']] += dataPoint['Score']
				
				# Populate the category hash. 
				codes = ["CAT-"+code, "CAT-"+code+entryYear, "CAT-"+code+entryYear+entryMonth]
				for curCode in codes:
					if curCode not in masterHash: 
						masterHash[curCode]={}
					if category not in masterHash[curCode]: 
						masterHash[curCode][category] = dataPoint['Score']
					else: 
						masterHash[curCode][category] += dataPoint['Score']
		
		print("Loading data for: " + city['code'] + " into redis")
		loadDataRedis(masterHash)
		masterHash = {}



def populateCacheALL ():
	print("Inside populateTopicsALL")
	sys.stdout.flush()

	masterHash = {}

	# Switch to topics table
	topics = Table(
	    "Topics",
	    connection=conn
	)
	
	for city in cityList:
		
		# New nested hash for this city.
		code = city['code'] 
		masterHash[code] = {}

		print("Querying all categories for:" + code + '\n')
		for category in CATEGORY_LIST:
			topicsData = topics.query(index='Categories',
				Category__eq=category,
				Date__beginswith=code)
			print("Query category:" + category + '\n')
			sys.stdout.flush()
			for dataPoint in topicsData:
				entryYear = dataPoint['Date'][3:][:-4]
				entryMonth = dataPoint['Date'][7:][:-2]
				#entryDay = dataPoint['Date'][9:]
			
				# Populate the topic hash. 
				codes = ['ALL', 'ALL'+entryYear, 'ALL'+entryYear+entryMonth]
				for curCode in codes:
					if curCode not in masterHash: masterHash[curCode]={}
					if dataPoint['Name'] not in masterHash[curCode]: 
						masterHash[curCode][dataPoint['Name']] = dataPoint['Score']
					else: 
				 		masterHash[curCode][dataPoint['Name']] += dataPoint['Score']
				
				# Populate the category cache. 
				codes = ["CAT-"+'ALL', "CAT-"+'ALL'+entryYear, "CAT-"+'ALL'+entryYear+entryMonth]
				for curCode in codes:
					if curCode not in masterHash: 
						masterHash[curCode]={}
					if category not in masterHash[curCode]: 
						masterHash[curCode][category] = dataPoint['Score']
					else: 
						masterHash[curCode][category] += dataPoint['Score']
	print("Loading data for: ALL into redis")
	loadDataRedis(masterHash)
	masterHash = {}


def loadDataRedis (sourceHash):
	r = redis.StrictRedis(host='localhost', port=6379, db=0)
	for key in sourceHash.keys():
		if sourceHash[key]:
			#print(key)
			sys.stdout.flush()
			r.hmset(key,sourceHash[key])
	return

def main(): 
	print("flushing redis")
	r = redis.StrictRedis(host='localhost', port=6379, db=0)
	r.flushdb()
	print("Load Cache History")
	print("==================")

	print("Loading Topic Data for cities...")
	sys.stdout.flush()
	populateCacheCities()

	print("Loading Topic Data for aggregated ALL...")
	sys.stdout.flush()
	populateCacheALL()
	
	print("Loading Category Data...")
	sys.stdout.flush()

main()



