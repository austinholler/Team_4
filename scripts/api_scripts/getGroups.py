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
#  Date: Feb 25, 2016
#  Purpose: To make a limited, by API specifications, number of calls to
#	    the meetup API for get groups. Finding all groups within cities
#	    from the JSON cities files that meet our criteria.
#  

import json
import urllib
import time
import os

''' getUSGroups: This function makes a "get groups" API call to the Meetup API.
	Taking a given state and city, inputted into the URL call, and parsing
	only the groups that match the designated city.
	
	Variables: state -> Specified state fetched from USCities.json and passed in
		   city -> Specified city fetched from USCities.json and passed in'''
def getUSGroups(state, city):
	
	off = 0
	
	US_groups = open('LrgCityGroups/{}-{}Groups.json'.format(city, state), 'a')
	
	if not (os.path.getsize('LrgCityGroups/{}-{}Groups.json'.format(city, state))):
		US_groups.write('{"groups":[')
			
	json_str = urllib.urlopen('https://api.meetup.com/2/groups?country=us&offset={}&city={}&sign=True&format=json&photo-host=public&state={}&page=200&radius=10.0&omit=visibility%2Ctopics%2Cdescription%2Clon%2Cgroup_photo%2Cjoin_mode%2Corganizer%2Ccategory%2Clat%2Cwho&order=members&desc=false&key=1a325f7b6f6b544733d615f4873136b'.format(off,city,state)).read()
	parsed_json = json.loads(json_str)
			
	arr_len = len(parsed_json['results'])
			
	for x in xrange(arr_len):
				
		#groups city must match searched city
		if (parsed_json['results'][x]['city'] == city and parsed_json['results'][x]['members'] > 99):
			city_json = json.dumps(parsed_json['results'][x])
			US_groups.write(city_json + ',')
			
	while (parsed_json['meta']['next'] and (parsed_json['results'][arr_len - 1]['members'] > 99)):
				
		#go to the next page
		off += 1
				
		json_str = urllib.urlopen('https://api.meetup.com/2/groups?country=us&offset={}&city={}&sign=True&format=json&photo-host=public&state={}&page=200&radius=10.0&omit=visibility%2Ctopics%2Cdescription%2Clon%2Cgroup_photo%2Cjoin_mode%2Corganizer%2Ccategory%2Clat%2Cwho&order=members&desc=false&key=1a325f7b6f6b544733d615f4873136b'.format(off,city,state)).read()
		parsed_json = json.loads(json_str)
				
		arr_len = len(parsed_json['results'])
			
		for x in xrange(arr_len):
				
			#groups city must match searched city
			if (parsed_json['results'][x]['city'] == city and parsed_json['results'][x]['members'] > 99):
				city_json = json.dumps(parsed_json['results'][x])
				US_groups.write(city_json + ',')
			
		#sleep prevents overuse of the API (200 calls/hr)
		time.sleep(18)
		
	#sleep prevents overuse of the API (200 calls/hr)
	time.sleep(18)
	
	#This gets rid of the last comma and puts the end on the JSON
	US_groups.seek(-1, os.SEEK_END)
	US_groups.truncate()
	US_groups.write(']}')
	
	return 0

''' getOtherGroups: This function makes a "get groups" API call to the Meetup API.
		    Taking a given country and city, inputted into the URL call, and parsing
		    only the groups that match the designated city.
	
	Variables: state -> Specified country fetched from otherCities.json and passed in
		   city -> Specified city fetched from otherCities.json and passed in'''

def getOtherGroups(country, city):
	
	off = 0
	
	other_groups = open('{}-{}Groups.json'.format(city, country), 'a')
			
	json_str = urllib.urlopen('https://api.meetup.com/2/groups?country={}&offset={}&city={}&sign=True&format=json&photo-host=public&page=200&radius=10.0&omit=visibility%2Ctopics%2Cdescription%2Clon%2Cgroup_photo%2Cjoin_mode%2Corganizer%2Ccategory%2Clat%2Cwho&order=members&desc=false&key=1a325f7b6f6b544733d615f4873136b'.format(country,off,city.encode('utf8'))).read()
	parsed_json = json.loads(json_str)
			
	arr_len = len(parsed_json['results'])
			
	for x in xrange(arr_len):
				
		#groups city must match searched city
		if (parsed_json['results'][x]['city'] == city):
			city_json = json.dumps(parsed_json['results'][x])
			other_groups.write(',' + city_json)
			
	while (parsed_json['meta']['next']):
				
		#go to the next page
		off += 1
				
		json_str = urllib.urlopen('https://api.meetup.com/2/groups?country={}&offset={}&city={}&sign=True&format=json&photo-host=public&page=200&radius=10.0&omit=visibility%2Ctopics%2Cdescription%2Clon%2Cgroup_photo%2Cjoin_mode%2Corganizer%2Ccategory%2Clat%2Cwho&order=members&desc=false&key=1a325f7b6f6b544733d615f4873136b'.format(country,off,city.encode('utf8'))).read()
		parsed_json = json.loads(json_str)
				
		arr_len = len(parsed_json['results'])
			
		for x in xrange(arr_len):
				
			#groups city must match searched city
			if (parsed_json['results'][x]['city'] == city):
				city_json = json.dumps(parsed_json['results'][x])
				other_groups.write(',' + city_json)
			
		#sleep prevents overuse of the API (200 calls/hr)
		time.sleep(18)
		
	#sleep prevents overuse of the API (200 calls/hr)
	time.sleep(18)
	
	#This gets rid of the last comma and puts the end on the JSON
	other_groups.seek(-1, os.SEEK_END)
	other_groups.truncate()
	other_groups.write(']}')
			
	return 0
			
def main():
	
	
	
	json_str = open('USCities.json','r').read()
	parsed_json = json.loads(json_str)
	
	for state in parsed_json:
		print("Working with state: {}".format(state))
		city = parsed_json[state][0]
		print("Working with city: {}".format(city))
		getUSGroups(state, city)
		'''for city in parsed_json[state]:
			print("Working with city: {}".format(city))
			getUSGroups(state, city)'''
			
	'''json_str = open('otherCities.json','r').read()
	parsed_json = json.loads(json_str)
	
	for country in parsed_json:
		print("Working with state: {}".format(country))
		for city in parsed_json[country]:
			print("Working with city: {}".format(city.encode('utf8')))
			getOtherGroups(country, city)'''
	
	return 0

if __name__ == '__main__':
	main()


