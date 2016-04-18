#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
#  processData.py
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
#  Created by: Austin Holler
#  Date: Mar 24, 2016
#  Purpose: Process a Meetups cities events into a usable format of data,
#			that can be uploaded to dynamoDB, and shows a topics 
#			popularity on any given date.
#    

import json
import time
import os
import math


'''doesntExist: This function is for if the processed event JSON file
				doesn't exist. Going through a cities events, processing
				the data, and creating a processed JSON file.
			   
	variables: fileName -> event file that's going to be processed
			   city -> used for file retrieval and naming
			   state -> same as city'''	
def doesntExist(fileName, city, state):
	
	#Create a dictionary, later turned into the JSON object/file
	topic_dict = {}
	
	#Get Events
	json_events = open('LrgCityEvents/{}'.format(fileName),'r').read()
	parsed_events = json.loads(json_events)
	
	#Create total events/rsvps keys for later use	
	topic_dict['num_events'] = 0
	topic_dict['total_rsvps'] = 0
			
	#Iterating through each event in event JSON file for processing
	for event in parsed_events['events']:
		
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
	post_file = open('ProcessedCities/processed-{}-{}.json'.format(city, state), 'a')
	post_file.write(cityEvents)
	
	print("Processed Stuff!!!")
	
	return 0
	
'''jsonExists: This function is for if the city events.json has had to 
			   be broken apart (e.g. New York-NYEvents.json - when there
			   already exists a processed JSON file to work with. It then
			   performs the same functionality as doesntExist, but overwrites.
			   
	variables: fileName -> event file that's going to be processed
			   city -> used for file retrieval and naming
			   state -> same as city'''
def jsonExists(fileName, city, state):
	
	#Opens and loads existing JSON file into usable dictionary
	post_json = open('ProcessedCities/processed-{}-{}.json'.format(city, state), 'r').read()
	parsed_post = json.loads(post_json)
	
	#Get JSON events file
	json_events = open('FullCOEvents/{}'.format(fileName),'r').read()
	parsed_events = json.loads(json_events)
			
	#Iterating through each event in event JSON file for processing		
	for event in parsed_events['events']:
		
		#Keeping events w/no attendance out	
		if event['yes_rsvp_count']:
			
			#Converts milliseconds since epoch to when event occured
			secs = (event['time'] + event['utc_offset'])/1000
			time_struct = time.gmtime(secs)
			date_format = time.strftime("%d-%m-%Y", time_struct)
			
			#Add to total event and rsvp count for later use
			parsed_post['num_events'] += 1
			parsed_post['total_rsvps'] += event['yes_rsvp_count']
			
			#Check for converted date in the dict
			if not date_format in parsed_post:
				
				#Date key added to existing dict w/a dict as value
				parsed_post[date_format] = {}
				
				#Iterate through an events topics	
				for topic in event['group']['topics']:
					
					#Check for topic key in above date dict 
					if not topic['urlkey'] in parsed_post[date_format]:
						
						#Topic key created and value added
						parsed_post[date_format][topic['urlkey']] = {}
						parsed_post[date_format][topic['urlkey']]['topic_id'] = topic['id']
						
						#Check for existence of 'category' in the current event
						#Apparently some groups/events aren't categorized
						if 'category' in event['group']:
							
							#Added category name/id to the above date dict
							parsed_post[date_format][topic['urlkey']]['category'] = event['group']['category']['shortname']
							parsed_post[date_format][topic['urlkey']]['category_id'] = event['group']['category']['id']
						
						#Else create a null category name/id as holder	
						else:
							parsed_post[date_format][topic['urlkey']]['category'] = 'null'
							parsed_post[date_format][topic['urlkey']]['category_id'] = 'null'
							
						#Add a score to the new topic based on rsvps
						parsed_post[date_format][topic['urlkey']]['score'] = event['yes_rsvp_count']
					
					#Else add to dates topic score based on rsvps	
					else:
						parsed_post[date_format][topic['urlkey']]['score'] += event['yes_rsvp_count']
						
			#Date key's in existing dictionary; the same basic process is
			#followed as above but adding to date instead of creating it		
			else:
				for topic in event['group']['topics']:
				
					if not topic['urlkey'] in parsed_post[date_format]:
						parsed_post[date_format][topic['urlkey']] = {}
						parsed_post[date_format][topic['urlkey']]['topic_id'] = topic['id']
						if 'category' in event['group']:
							parsed_post[date_format][topic['urlkey']]['category'] = event['group']['category']['shortname']
							parsed_post[date_format][topic['urlkey']]['category_id'] = event['group']['category']['id']
						else:
							parsed_post[date_format][topic['urlkey']]['category'] = 'null'
							parsed_post[date_format][topic['urlkey']]['category_id'] = 'null'
						parsed_post[date_format][topic['urlkey']]['score'] = event['yes_rsvp_count']
						
					else:
						parsed_post[date_format][topic['urlkey']]['score'] += event['yes_rsvp_count']
	
	#Create a pretty json, overwrite old JSON w/new JSON object	
	cityEvents = json.dumps(parsed_post, sort_keys=True, indent=4, separators=(',', ': '))
	post_file = open('ProcessedCities/processed-{}-{}.json'.format(city, state), 'w')
	post_file.write(cityEvents)
	
	print("Processed Stuff!!!")
	
	return 0

'''normalizeData: This function takes a cities processed events JSON file
				  and normalizes the "topic score" as a z-score.
				  
	Variables: fileName -> the name of the file being worked with'''	
def normalizeData(fileName):
	
	#Open processed JSON file and create a dictionary
	json_str = open('ProcessedCities/{}'.format(fileName),'r').read()
	topic_dict = json.loads(json_str)
	
	#Assign total events/rsvps variables
	total_events = topic_dict['num_events']
	total_rsvps = topic_dict['total_rsvps']
	
	#Determine the population mean
	mean = total_rsvps/total_events
	
	#Delete the keys, they're no longer needed
	del topic_dict['num_events']
	del topic_dict['total_rsvps']
	
	#Declare variance numerator and denominator	
	var_num = 0
	var_den = 0
	
	#First loop through data to determine population variance		
	for entry in topic_dict:
		for topic in topic_dict[entry]:
			var_num += topic_dict[entry][topic]['score']**2
			var_den += 1
	
	#Declare and calculate population deviation (i.e. sqrt variance)
	deviation = math.sqrt(var_num/var_den)
	
	#Second loop through data to update score to a normalized z-score
	# z-score = absolute value of (score - pop. mean)/pop. deviation	
	for entry in topic_dict:
		for topic in topic_dict[entry]:
			topic_dict[entry][topic]['score'] = abs((topic_dict[entry][topic]['score'] - mean)/deviation)
	
	#Create a pretty json, overwrite old JSON w/new JSON object
	cityEvents = json.dumps(topic_dict, sort_keys=True, indent=4, separators=(',', ': '))
	post_file = open('ProcessedCities/{}'.format(fileName), 'w')
	post_file.write(cityEvents)
	
	return 0
	

def main():
	
	#Create a list of events from given folder
	filesList = os.listdir('LrgCityEvents')
	
	for x in filesList:
		
		#Split file name and retrieve the city/state being worked with
		name_split = x.split('-')	
		city = name_split[0]
		state = name_split[1][:2]
		
		print("Processing file {}...".format(x))
		
		#If a processed city file already exists use jsonExists
		#Else use doesntExist
		if (os.path.isfile('ProcessedCities/processed-{}-{}.json'.format(city, state))):
			jsonExists(x, city, state)
		else:
			doesntExist(x, city, state)
	
	#Create a list of processed city events files from given folder	
	fileList = os.listdir('ProcessedCities')
	
	for x in fileList:
		
		print("Normalizing {} Data...".format(x))
		
		#Normalize the data
		normalizeData(x)
		
		print("{} Processed!!!".format(x))
		
	return 0

if __name__ == '__main__':
	main()

