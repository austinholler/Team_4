#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
#  updateDynamo.py
#  
#  Copyright 2016 user <user@cu-cs-vm>
#  
#  This program is free software; you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation; either version 2 of the License, or
#  (at your option) any later version.
#  
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#  
#  You should have received a copy of the GNU General Public License
#  along with this program; if not, write to the Free Software
#  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
#  MA 02110-1301, USA.
#
#  Created by: Andrew Candelaresi
#  Date: Mar 25, 2016
#  Purpose: Process a Meetups cities events into a usable format of data,
#			that can be uploaded to dynamoDB, and shows a topics 
#			popularity on any given date.
#    

import urllib
import json
import time
import os
import math


def getUSEvents():
	
	off = 0
	current_time = int (round(time.time()))*1000
	tomorrow = current_time - 86400000

	json_str = urllib.urlopen('https://api.meetup.com/2/open_events?key=80248d92f41752948556153452941&sign=true&photo-host=public&country=us&city=denver&state=co&fields=topics,category&time={},{}&omit=description,how_to_find_us,&page=200&radius=15.0'.format(tomorrow, current_time)).read()
	parsed_json = json.loads(json_str)
	
	arr_len = len(parsed_json['results'])
		
	while (parsed_json['meta']['next']): #and (parsed_json['results'][arr_len - 1]['members'] > 99)):
				
		#go to the next page
		off += 1
		print(off)
				
		json_str = urllib.urlopen('https://api.meetup.com/2/open_events?key=80248d92f41752948556153452941&sign=true&photo-host=public&country=us&offset={}&city=denver&state=co&fields=topics,category&time={},{}&omit=description,how_to_find_us,&page=200&radius=15.0'.format(off, tomorrow, current_time)).read()
		parsed_json = json.loads(json_str)	
		
			
	
			
		#sleep prevents overuse of the API (200 calls/hr)
		time.sleep(.40)
		
	arr_len = len(parsed_json['results'])
	#for x in xrange(arr_len):
		#print parsed_json['results'][x]		
	return (parsed_json)

def processJson(parsed_json):
	print ('hi')
	
	#Create a dictionary, later turned into the JSON object/file
	topic_dict = {}
	
	#Create total events/rsvps keys for later use	
	topic_dict['num_events'] = 0
	topic_dict['total_rsvps'] = 0
	
	arr_len = len(parsed_json['results'])
	
	#Iterating through each event in event JSON file for processing
	for x in xrange(arr_len):
		event = parsed_json['results'][x]
		#Keeping events w/no attendance out	
		if event['yes_rsvp_count']:
			
			#Converts milliseconds since epoch to when event occured
			secs = (event['time'] + event['utc_offset'])/1000
			time_struct = time.gmtime(secs)
			date_format = time.strftime("%d-%m-%Y", time_struct)
			
			#Add to total event and rsvp count for later use
			topic_dict['num_events'] += 1
			topic_dict['total_rsvps'] += event['yes_rsvp_count']
			
			#Check for converted date in the dict
			if not date_format in topic_dict:
				
				#Date key added to new dict w/a dict as value	
				topic_dict[date_format] = {}
				
				#Iterate through an events topics	
				for topic in event['group']['topics']:
					
					#Check for topic key in above date dict
					if not topic['urlkey'] in topic_dict[date_format]:
						
						#Topic key created and value added
						topic_dict[date_format][topic['urlkey']] = {}
						topic_dict[date_format][topic['urlkey']]['topic_id'] = topic['id']
						
						#Check for existence of 'category' in the current event
						#Apparently some groups/events aren't categorized
						if 'category' in event['group']:
							
							#Added category name/id to the above date dict
							topic_dict[date_format][topic['urlkey']]['category'] = event['group']['category']['shortname']
							topic_dict[date_format][topic['urlkey']]['category_id'] = event['group']['category']['id']
							
						#Else create a null category name/id as holder
						else:
							topic_dict[date_format][topic['urlkey']]['category'] = 'null'
							topic_dict[date_format][topic['urlkey']]['category_id'] = 'null'
						
						#Add a score to the new topic based on rsvps
						topic_dict[date_format][topic['urlkey']]['score'] = event['yes_rsvp_count']
					
					#Else add to dates topic score based on rsvps	
					else:
						topic_dict[date_format][topic['urlkey']]['score'] += event['yes_rsvp_count']
			
			#Date key's in created dictionary; the same basic process is
			#followed as above but adding to date instead of creating it
			else:
				for topic in event['group']['topics']:
				
					if not topic['urlkey'] in topic_dict[date_format]:
						topic_dict[date_format][topic['urlkey']] = {}
						topic_dict[date_format][topic['urlkey']]['topic_id'] = topic['id']
						if 'category' in event['group']:
							topic_dict[date_format][topic['urlkey']]['category'] = event['group']['category']['shortname']
							topic_dict[date_format][topic['urlkey']]['category_id'] = event['group']['category']['id']
						else:
							topic_dict[date_format][topic['urlkey']]['category'] = 'null'
							topic_dict[date_format][topic['urlkey']]['category_id'] = 'null'
						topic_dict[date_format][topic['urlkey']]['score'] = event['yes_rsvp_count']
					else:
						topic_dict[date_format][topic['urlkey']]['score'] += event['yes_rsvp_count']
	
	#Create a pretty json object and write new JSON file	
	cityEvents = json.dumps(topic_dict, sort_keys=True, indent=4, separators=(',', ': '))
	print(cityEvents)
	#post_file = open('ProcessedCOCities/processed-{}-{}.json'.format('Denver', 'Colorado'), 'w')
	#post_file.write(cityEvents)
	
	print("Processed Stuff!!!")

def main():
	
	
	
	
	toProcess = getUSEvents()
	processJson(toProcess)
	return 0

if __name__ == '__main__':
	main()
