#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
#  sample_query.py
#
#  Created By: Matt Bubernak 
#  Date: Feb 23, 2016
#  Purpose: Simple API call and write to json file. 


import json
import urllib.request
import time
import shutil

def sampleQuery():
	url = 'https://api.meetup.com/2/open_events?zip=80027&and_text=False&offset=0&format=json&limited_events=False&state=co&photo-host=public&page=20&radius=25.0&desc=False&status=upcoming&sig_id=199454038&sig=b0c16b28ca66756084072458681946af2979de17'
	r = urllib.request.urlopen(url)
	data = json.loads(r.read().decode(r.info().get_param('charset') or 'utf-8'))
	data = data["results"]
	#for arrayElem in data:
	#	arrayElem["description"] = "REMOVED"
	return data

def main():
	
	# Query DB for some sample data 
	sample_json = sampleQuery()
	
	# Write to json file
	with open('sampleQuery.json','w') as outfile:
		json.dump(sample_json, outfile)
		
	return 0

if __name__ == '__main__':
	main()

