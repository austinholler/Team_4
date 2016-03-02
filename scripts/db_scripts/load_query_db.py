#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
#  load_query_db.py
#
#  Created By: Matt Bubernak 
#  Date: Feb 24, 2016
#  Purpose: Loads json file into specific mongo instance. 
#
# Requires pymongo: 
# python -m pip install pymongo

import json
import time
import pymongo
import sys


def main():
	# User must provide 3 arguments
	if (len(sys.argv) < 4):
		sys.exit("USAGE: py load_query_db.py [dbName] [collectionName] [jsonPath]")
	name = sys.argv[1]
	collection = sys.argv[2]
	path = sys.argv[3]

	# Load the data
	loadJsonIntoMongo(name,collection,path)

	return 0

def loadJsonIntoMongo(dbName,collectionName,jsonPath):

	print("Using DB: " + dbName + "\nCollection: " + collectionName + "\nJson Path:" + jsonPath)
	# Create mongo client
	from pymongo import MongoClient
	client = MongoClient()

	# Connect to test database
	db = client[dbName]

	# Use meetupsample collection within test database
	collection = db[collectionName]

	# Open a json file 
	json_data = open(jsonPath).read()

	# Load json into data 
	data = json.loads(json_data)

	# Insertion into the events collection
	if (collectionName == "events"):
		collection.insert(data[collectionName])

	# Insertion into the cities collection
	elif (collectionName == "cities"):
		# for every state
		for state in data.keys():
			# for every city
			for name in data[state]:
				# Insert a JSON object for this state containing the name/state. 
				collection.insert({"name":name,"state":state})

	# Insertion into the groups collection
	elif (collectionName == "groups"):
		collection.insert(data[collectionName])

	# Don't currently support any other types of insertion
	else: 
		sys.exit("Only supports inserting into events, cities, or groups")


if __name__ == '__main__':
	main()

