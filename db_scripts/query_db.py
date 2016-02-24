#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
#  query_db.py
#
#  Created By: Matt Bubernak 
#  Date: Feb 24, 2016
#  Purpose: Some simple examples of queries and map/reduce 
#
# Requires pymongo: 
# python -m pip install pymongo

import json
import time
import pymongo
from bson.code import Code

# Sample map code 
map = Code("function () {"
            "    emit(this.zip, 20);"
            "}")

# Sample reduce code 
reduce = Code("function (key, values) {"
               "  var total = 0;"
               "  for (var i = 0; i < values.length; i++) {"
               "    total += values[i];"
               "  }"
               "  return total;"
               "}")

def main():

	# Create a new mongo client
	from pymongo import MongoClient
	client = MongoClient()

	# Access db called test
	db = client["test"]

	# Access collection called meetupsample
	collection = db["meetupsample"]

	# Grab 1 item from collection
	querySingle = collection.find_one()

	# Grab all items from collection
	queryAll = collection.find()

	# Grab one item with specific field
	querySpecific = collection.find({'city': 'Arvada'})

	# Map Reduce 
	#mapReduc = db.map_reduce(map,reduce,"meetupsample",full_response=True)

	#print(mapReduc)

	return 0

if __name__ == '__main__':
	main()

