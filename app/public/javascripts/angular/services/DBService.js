/**
 * Created by socce on 3/24/2016.
 */
angular.module('DBService', []).service('DatabaseService', function($http,$q) {
    this.data = []

    this.init = function() {
        this.data.push('test1');
        this.data.push('test2');
        console.log('inside init')
        return "initd"
    }
    this.getData = function(){
        console.log('inside getData')

        return data
    }
})