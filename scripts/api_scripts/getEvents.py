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
import os

''' getUSEvents: This function makes a "get events" API call to the Meetup API.
	Taking a given event status and group ID, inputted into the URL call,
	adding extra info to returned JSON and writing it out.
	
	Variables: status -> API term for either upcoming events or past events
			   idNum -> Specified group ID fetched from USGroups.json and passed in
			   state -> Specified group state fetched from USGroups.json and passed in
			   city -> Specified group city fetched from USGroups.json and passed in'''
def getUSEvents(status, idNum, state, city, rating, members):
	#Starting Page
	off = 0
	
	US_groups = open('LrgCityEvents/{}-{}Events.json'.format(city, state), 'a')
	
	if not (os.path.getsize('LrgCityEvents/{}-{}Events.json'.format(city, state))):
		US_groups.write('{"events":[')
	
	#Get Events		
	json_str = urllib.urlopen('https://api.meetup.com/2/events?offset={}&sign=True&format=json&limited_events=True&group_id={}&photo-host=public&page=200&fields=category,topics&only=event_url,group,id,name,time,utc_offset,yes_rsvp_count&key=1a325f7b6f6b544733d615f4873136b&order=time&status={}&desc=false'.format(off, idNum, status)).read()
	parsed_json = json.loads(json_str)
			
	arr_len = len(parsed_json['results'])
	
	#For each position in the returned "results" array		
	for x in xrange(arr_len):
		
		#Add city, country, group id, group rating, num of group members	
		parsed_json['results'][x]['city'] = city
		parsed_json['results'][x]['state'] = state
		parsed_json['results'][x]['group']['rating'] = rating
		parsed_json['results'][x]['group']['members'] = members
		
		#Cleaning up object
		del parsed_json['results'][x]['group']['created']
		del parsed_json['results'][x]['group']['group_lat']
		del parsed_json['results'][x]['group']['group_lon']
		del parsed_json['results'][x]['group']['who']
		
		#Write out JSON object
		event_json = json.dumps(parsed_json['results'][x])
		US_groups.write(event_json + ',')
	
	#While there's a next page to go to		
	while (parsed_json['meta']['next']):
			
		#go to the next page
		off += 1
				
		json_str = urllib.urlopen('https://api.meetup.com/2/events?offset={}&sign=True&format=json&limited_events=True&group_id={}&photo-host=public&page=200&fields=category,topics&only=event_url,group,id,name,time,utc_offset,yes_rsvp_count&key=1a325f7b6f6b544733d615f4873136b&order=time&status={}&desc=false'.format(off, idNum, status)).read()
		parsed_json = json.loads(json_str)
				
		arr_len = len(parsed_json['results'])
		
		#For each position in the returned "results" array	
		for x in xrange(arr_len):
			
			#Add city, country, group id, group rating, num of group members	
			parsed_json['results'][x]['city'] = city
			parsed_json['results'][x]['state'] = state
			parsed_json['results'][x]['group']['rating'] = rating
			parsed_json['results'][x]['group']['members'] = members
			
			#Cleaning up object
			del parsed_json['results'][x]['group']['created']
			del parsed_json['results'][x]['group']['group_lat']
			del parsed_json['results'][x]['group']['group_lon']
			del parsed_json['results'][x]['group']['who']
		
			#Write out JSON object
			event_json = json.dumps(parsed_json['results'][x])
			US_groups.write(event_json + ',')
			
		#sleep prevents overuse of the API (200 calls/hr)
		time.sleep(18)
		
	#sleep prevents overuse of the API (200 calls/hr)
	time.sleep(18)
			
	return 'LrgCityEvents/{}-{}Events.json'.format(city, state)

''' getOtherEvents: This function makes a "get events" API call to the Meetup API.
	Taking a given event status and group ID, inputted into the URL call,
	adding extra info to returned JSON and writing it out.
	
	Variables: status -> API term for either upcoming events or past events
			   idNum -> Specified group ID fetched from USGroups.json and passed in
			   country -> Specified group country fetched from USGroups.json and passed in
			   city -> Specified group city fetched from USGroups.json and passed in'''

def getOtherEvents(status, idNum, country, city, rating, members):
	#Starting Page
	off = 0
	
	other_groups = open('otherEvents.json', 'a')
	
	#Get Events		
	json_str = urllib.urlopen('https://api.meetup.com/2/events?offset={}&sign=True&format=json&limited_events=True&group_id={}&photo-host=public&page=200&fields=category,topics&only=event_url,group,id,name,time,utc_offset,yes_rsvp_count&key=1a325f7b6f6b544733d615f4873136b&order=time&status={}&desc=false'.format(off, idNum, status)).read()
	parsed_json = json.loads(json_str)
			
	arr_len = len(parsed_json['results'])
	
	#For each position in the returned "results" array		
	for x in xrange(arr_len):
		
		#Add city, country, and group id; write out JSON object.		
		parsed_json['results'][x]['city'] = city
		parsed_json['results'][x]['country'] = country
		parsed_json['results'][x]['group']['rating'] = rating
		parsed_json['results'][x]['group']['members'] = members
		
		#Cleaning up object
		del parsed_json['results'][x]['group']['created']
		del parsed_json['results'][x]['group']['group_lat']
		del parsed_json['results'][x]['group']['group_lon']
		del parsed_json['results'][x]['group']['who']
		
		#Write out JSON object
		event_json = json.dumps(parsed_json['results'][x])
		other_groups.write(',' + event_json)
	
	#While there's a next page to go to		
	while (parsed_json['meta']['next']):
			
		#go to the next page
		off += 1
				
		json_str = urllib.urlopen('https://api.meetup.com/2/events?offset={}&sign=True&format=json&limited_events=True&group_id={}&photo-host=public&page=200&fields=category,topics&only=event_url,group,id,name,time,utc_offset,yes_rsvp_count&key=1a325f7b6f6b544733d615f4873136b&order=time&status={}&desc=false'.format(off, idNum, status)).read()
		parsed_json = json.loads(json_str)
				
		arr_len = len(parsed_json['results'])
		
		#For each position in the returned "results" array	
		for x in xrange(arr_len):
			
			#Add city, country, and group id; write out JSON object.	
			parsed_json['results'][x]['city'] = city
			parsed_json['results'][x]['country'] = country
			parsed_json['results'][x]['group']['rating'] = rating
			parsed_json['results'][x]['group']['members'] = members
			
			#Cleaning up object
			del parsed_json['results'][x]['group']['created']
			del parsed_json['results'][x]['group']['group_lat']
			del parsed_json['results'][x]['group']['group_lon']
			del parsed_json['results'][x]['group']['who']
		
			#Write out JSON object
			event_json = json.dumps(parsed_json['results'][x])
			other_groups.write(',' + event_json)
			
		#sleep prevents overuse of the API (200 calls/hr)
		time.sleep(18)
		
	#sleep prevents overuse of the API (200 calls/hr)
	time.sleep(18)
			
	return 0
			
def main():
	
	
	#Get US Events
	json_str = open('CO_Groups/Colorado Springs-COGroups.json','r').read()
	parsed_json = json.loads(json_str)
	
	filehandle = ''
	
	#For each group in the JSON
	for group in parsed_json['groups']:
		
		#Assign group ID and location for use
		idNum = group['id']
		city = group['city']
		state = group['state']
		rating = group['rating']
		mem_count = group['members']
		
		print("Working with group id: " + str(idNum))
		
		print("Doing Past")
		getUSEvents("past", idNum, state, city, rating, mem_count)
		print("Doing Upcoming")
		filehandle = getUSEvents("upcoming", idNum, state, city, rating, mem_count)
		
	#This gets rid of the last comma and puts the end on the JSON
	with open(filehandle, 'rb+') as x:
		x.seek(-1, os.SEEK_END)
		x.truncate()
		x.write(']}')
	
	'''#Get Other Events		
	json_str = open('otherGroups.json','r').read()
	parsed_json = json.loads(json_str)
	
	#For each group in the JSON
	for group in parsed_json['groups']:
		
		#Assign group ID and location for use
		idNum = group['id']
		city = group['city'].encode('utf8')
		country = group['country']
		rating = group['rating']
		mem_count = group['members']
		
		print("Working with group id: " + str(idNum))
		
		print("Doing Past")
		getOtherEvents("past", idNum, country, city, rating, mem_count)
		print("Doing Upcoming")
		getOtherEvents("upcoming", idNum, country, city, rating, mem_count)'''
	
	return 0

if __name__ == '__main__':
	main()


