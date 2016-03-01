#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
#  getGroups.py
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
#  Date: Feb 28, 2016
#  Purpose: To make a limited, by API specifications, number of calls to
#			the meetup API for get events. Finding all events, past and
#			upcoming, occuring within a certain group.
#  

import json
import urllib
import time

''' getUSEvents: This function makes a "get events" API call to the Meetup API.
	Taking a given event status and group ID, inputted into the URL call,
	adding extra info to returned JSON and writing it out.
	
	Variables: status -> API term for either upcoming events or past events
			   idNum -> Specified group ID fetched from USGroups.json and passed in
			   state -> Specified group state fetched from USGroups.json and passed in
			   city -> Specified group city fetched from USGroups.json and passed in'''
def getUSEvents(status, idNum, state, city):
	#Starting Page
	off = 0
	
	other_groups = open('USEvents.json', 'a')
	
	#Get Events		
	json_str = urllib.urlopen('https://api.meetup.com/2/events?offset={}&sign=True&format=json&limited_events=True&group_id={}&photo-host=public&page=200&&key=1a325f7b6f6b544733d615f4873136b&order=time&status={}&desc=false'.format(off, idNum, status)).read()
	parsed_json = json.loads(json_str)
			
	arr_len = len(parsed_json['results'])
	
	#For each position in the returned "results" array		
	for x in xrange(arr_len):
		
		#Add city and country; write out JSON object.		
		parsed_json['results'][x]['city'] = city
		parsed_json['results'][x]['state'] = state
		event_json = json.dumps(parsed_json['results'][x])
		other_groups.write(',' + event_json)
	
	#While there's a next page to go to		
	while (parsed_json['meta']['next']):
			
		#go to the next page
		off += 1
				
		json_str = urllib.urlopen('https://api.meetup.com/2/events?offset={}&sign=True&format=json&limited_events=True&group_id={}&photo-host=public&page=200&&key=1a325f7b6f6b544733d615f4873136b&order=time&status={}&desc=false'.format(off, idNum, status)).read()
		parsed_json = json.loads(json_str)
				
		arr_len = len(parsed_json['results'])
		
		#For each position in the returned "results" array	
		for x in xrange(arr_len):
			
			#Add city and country; write out JSON object.	
			parsed_json['results'][x]['city'] = city
			parsed_json['results'][x]['state'] = state
			event_json = json.dumps(parsed_json['results'][x])
			other_groups.write(',' + event_json)
			
		#sleep prevents overuse of the API (200 calls/hr)
		time.sleep(18)
		
	#sleep prevents overuse of the API (200 calls/hr)
	time.sleep(18)
			
	return 0

''' getOtherEvents: This function makes a "get events" API call to the Meetup API.
	Taking a given event status and group ID, inputted into the URL call,
	adding extra info to returned JSON and writing it out.
	
	Variables: status -> API term for either upcoming events or past events
			   idNum -> Specified group ID fetched from USGroups.json and passed in
			   country -> Specified group country fetched from USGroups.json and passed in
			   city -> Specified group city fetched from USGroups.json and passed in'''

def getOtherEvents(status, idNum, country, city):
	#Starting Page
	off = 0
	
	other_groups = open('otherEvents.json', 'a')
	
	#Get Events		
	json_str = urllib.urlopen('https://api.meetup.com/2/events?offset={}&sign=True&format=json&limited_events=True&group_id={}&photo-host=public&page=200&&key=1a325f7b6f6b544733d615f4873136b&order=time&status={}&desc=false'.format(off, idNum, status)).read()
	parsed_json = json.loads(json_str)
			
	arr_len = len(parsed_json['results'])
	
	#For each position in the returned "results" array		
	for x in xrange(arr_len):
		
		#Add city and country; write out JSON object.		
		parsed_json['results'][x]['city'] = city
		parsed_json['results'][x]['country'] = country
		event_json = json.dumps(parsed_json['results'][x])
		other_groups.write(',' + event_json)
	
	#While there's a next page to go to		
	while (parsed_json['meta']['next']):
			
		#go to the next page
		off += 1
				
		json_str = urllib.urlopen('https://api.meetup.com/2/events?offset={}&sign=True&format=json&limited_events=True&group_id={}&photo-host=public&page=200&&key=1a325f7b6f6b544733d615f4873136b&order=time&status={}&desc=false'.format(off, idNum, status)).read()
		parsed_json = json.loads(json_str)
				
		arr_len = len(parsed_json['results'])
		
		#For each position in the returned "results" array	
		for x in xrange(arr_len):
			
			#Add city and country; write out JSON object.	
			parsed_json['results'][x]['city'] = city
			parsed_json['results'][x]['country'] = country
			event_json = json.dumps(parsed_json['results'][x])
			other_groups.write(',' + event_json)
			
		#sleep prevents overuse of the API (200 calls/hr)
		time.sleep(18)
		
	#sleep prevents overuse of the API (200 calls/hr)
	time.sleep(18)
			
	return 0
			
def main():
	
	
	#Get US Events
	json_str = open('USGroups.json','r').read()
	parsed_json = json.loads(json_str)
	
	#For each group in the JSON
	for group in parsed_json['groups']:
		
		#Assign group ID and location for use
		idNum = group['id']
		city = group['city']
		state = group['state']
		
		print("Working with group id: " + str(idNum))
		
		print("Doing Past")
		getUSEvents("past", idNum, state, city)
		print("Doing Upcoming")
		getUSEvents("upcoming", idNum, state, city)
	
	#Get Other Events		
	json_str = open('otherGroups.json','r').read()
	parsed_json = json.loads(json_str)
	
	#For each group in the JSON
	for group in parsed_json['groups']:
		
		#Assign group ID and location for use
		idNum = group['id']
		city = group['city'].encode('utf8')
		country = group['country']
		
		print("Working with group id: " + str(idNum))
		
		print("Doing Past")
		getOtherEvents("past", idNum, country, city)
		print("Doing Upcoming")
		getOtherEvents("upcoming", idNum, country, city)
	
	return 0

if __name__ == '__main__':
	main()

