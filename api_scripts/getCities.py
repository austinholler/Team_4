#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
#  getCities.py
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
#  Created By: Austin Holler 
#  Date: Feb 20, 2016
#  Purpose: To make a limited, by API specifications, number of calls to
#			the meetup API for get cities. Finding all cities within countries/
#			states that meet our criteria (i.e 100+ members).
#

import json
import urllib
import time

''' getCitiesUS: This function makes a "get city" API call to the Meetup API.
	Looping through a location array, inputted into the URL call, and parsing
	only the cities that match our designated threshold.
	
	Variables: loc_arr -> An array full of US state abbreviation strings '''
def getCitiesUS(loc_arr):	
	
	#create a dictionary for cities {'state':[array of cities]}
	city_dict = {}
	
	for state in loc_arr:
		#starting API page offset
		off = 0
		#create an array for storing cities per state
		city_arr = []
		city = ""
		
		#opening and reading the 'get city' API
		json_str = urllib.urlopen('https://api.meetup.com/2/cities?country=us&offset={}&sign=True&format=json&photo-host=public&state={}&page=200&order=size&desc=false'.format(off,state)).read()
		
		parsed_json = json.loads(json_str)
		
		#get length outside of loop
		arr_len = len(parsed_json['results'])
		
		#sorting through JSON for cities
		for x in xrange(arr_len):
			
			#city membership must be 100+ to be considered significant
			if (parsed_json['results'][x]['member_count'] > 99):
				city = parsed_json['results'][x]['city']
				#adds cities to an array
				city_arr.append(city)
		
		#while there's a 'next' URL and the data will contain cities
		#that meet the 100+ threshold continue on to the 'next' URL
		while (parsed_json['meta']['next']) and ((parsed_json['results'][arr_len - 1]['member_count'] > 99)):
			
			#go to the next page
			off += 1
			
			#opening and reading next 'get city' API
			json_str = urllib.urlopen('https://api.meetup.com/2/cities?country=us&offset={}&sign=True&format=json&photo-host=public&state={}&page=200&order=size&desc=false'.format(off,state)).read()
			parsed_json = json.loads(json_str)
			
			#get length outside of loop
			arr_len = len(parsed_json['results'])
			
			#sorting through JSON for cities
			for x in xrange(arr_len):
				#city membership must be 100+ to be considered significant
				if (parsed_json['results'][x]['member_count'] > 99):
					city = parsed_json['results'][x]['city']
					#adds cities to an array
					city_arr.append(city)
			
			#sleep prevents overuse of the API (200 calls/hr)
			time.sleep(18)
		
		#add the state as a key that corresponds to the city array
		city_dict[state] = city_arr
		
		#sleep prevents overuse of the API (200 calls/hr)
		time.sleep(18)
		
	return city_dict
		
''' getCitiesOther: This function makes a "get city" API call to the Meetup API.
	Looping through a location array, inputted into the URL call, and parsing
	only the cities that match our designated threshold. The same as getCitiesUS 
	except a formatting change to handle countries other than the US.
	
	Variables: loc_arr -> An array full of country abbreviation strings '''
def getCitiesOther(loc_arr):
	
	#create a dictionary for cities {'state':[array of cities]}
	city_dict = {}
	
	for state in loc_arr:
		#starting API page offset
		off = 0
		#create an array for storing cities per state
		city_arr = []
		city = ""
		
		#opening and reading the 'get city' API
		json_str = urllib.urlopen('https://api.meetup.com/2/cities?country={}&offset={}&sign=True&format=json&photo-host=public&page=200&order=size&desc=false'.format(state,off)).read()
		
		parsed_json = json.loads(json_str)
		
		#get length outside of loop
		arr_len = len(parsed_json['results'])
		
		#sorting through JSON for cities
		for x in xrange(arr_len):
			
			#city membership must be 100+ to be considered significant
			if (parsed_json['results'][x]['member_count'] > 99):
				city = parsed_json['results'][x]['city']
				#adds cities to an array
				city_arr.append(city)
		
		#while there's a 'next' URL and the data will contain cities
		#that meet the 100+ threshold continue on to the 'next' URL
		while (parsed_json['meta']['next']) and ((parsed_json['results'][arr_len - 1]['member_count'] > 99)):
			
			#go to the next page
			off += 1
			
			#opening and reading next 'get city' API
			json_str = urllib.urlopen('https://api.meetup.com/2/cities?country={}&offset={}&sign=True&format=json&photo-host=public&page=200&order=size&desc=false'.format(state,off)).read()
			parsed_json = json.loads(json_str)
			
			#get length outside of loop
			arr_len = len(parsed_json['results'])
			
			#sorting through JSON for cities
			for x in xrange(arr_len):
				#city membership must be 100+ to be considered significant
				if (parsed_json['results'][x]['member_count'] > 99):
					city = parsed_json['results'][x]['city']
					#adds cities to an array
					city_arr.append(city)
			
			#sleep prevents overuse of the API (200 calls/hr)
			time.sleep(18)
			
		#add the state as a key that corresponds to the city array
		city_dict[state] = city_arr
		
		#sleep prevents overuse of the API (200 calls/hr)	
		time.sleep(18)
		
		
	return city_dict

def main():
	
	US_arr = ["AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"]
	other_arr = ["DE"]
	
	US_json = json.dumps(getCitiesUS(US_arr))
	
	other_json = json.dumps(getCitiesOther(other_arr))
	
	US_file = open('USCities.txt', 'a')
	other_file = open('otherCities.txt', 'a')
	
	
	US_file.write(US_json)
	other_file.write(other_json)
	
	return 0

if __name__ == '__main__':
	main()

