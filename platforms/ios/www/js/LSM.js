var stringDate = function (d) {
    return d.toJSON().replace(/[-:T]/g, '').substr(0, 8);
}
var dateKey = function (d) {
    if (!d) {
        d = new Date();
    }else if(!d.getTime){
        if((new Date(d) !== "Invalid Date") && !isNaN(new Date(d))){
            d= new Date(d)
        }else{
            d= new Date();
        }
    }
    //d = new Date(d.getTime() + (d.getTimezoneOffset() * 60000));
    //console.log(d);
    //var d = new Date();
    var mm = d.getMonth() + 1; // getMonth() is zero-based
    var dd = d.getDate();

    return [d.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('-');
    //return d.getFullYear()+"-"+d.get
        //.split("T")[0];
}
function loadLSM(name, resultcallback) {

    NativeStorage.getItem(name, function (result) {
        if (resultcallback) {
            resultcallback(result || []);
        }
    }, function (error) {
        if (error.exception !== "" && error.exception !== null) {
            console.log(error.exception);

        }
        if (error.code == 2) {
            resultcallback([]);
        }
    });
}

function selectLSM(name, item, keyname, resultcallback) {

    NativeStorage.getItem(name, function (result) {
        var tmp = result.filter(function (x) { return x[keyname] == item[keyname]; }) || [];
        if (resultcallback) {
            resultcallback(tmp);
        }
    }, function (error) {
        if (error.exception !== "" && error.exception !== null) {
            console.log(error.exception);
        }
        if (error.code == 2) {
            if (resultcallback) {
                resultcallback([]);
            }
        }
    });

}

function replaceLSM(name, item, keyname) {
    selectLSM(name, item, keyname, function (oldData) {
        if (oldData && oldData.length > 0) {
            updateLSM(name, item, keyname);
        } else {
            insertLSM(name, item);
        }
    });
}

function insertLSM(name, item) {
    loadLSM(name, function (oldData) {
        if (oldData && oldData.length) {
            oldData.push(item);
        } else {
            oldData = [item];
        }
        NativeStorage.setItem(name, oldData, function (data) {

        }, function (error) {
            console.log(error);
        });
    });
}
function updateLSM(name, item, keyname) {
    loadLSM(name, function (oldData) {
        if (oldData && oldData.length) {
            var change = false;
            for (var i = 0; i < oldData.length; i++) {
                var it = oldData[i];
                if (it[keyname] == item[keyname]) {
                    change = true;
                    oldData[i] = assignObject(oldData[i], item);
                }
            }
            if (change) {
                NativeStorage.setItem(name, oldData, function (data) {

                }, function (error) {
                    console.log(error);
                });
            }
        }
    });
}
function deleteLSM(name, item, keyname) {
    loadLSM(name, function (oldData) {
        if (oldData && oldData.length) {
            var change = false;
            for (var i = oldData.length - 1; i > -1; i--) {
                var it = oldData[i];
                if (it[keyname] == item[keyname]) {
                    change = true;
                    oldData.splice(i, 1);
                }
            }
            if (change) {
                NativeStorage.setItem(name, oldData, function (data) {

                }, function (error) {
                    console.log(error);
                });
            }
        }
    });

}
function findObject(arr, obj, key) {
    if (!Array.isArray(arr) || arr.length == 0) {
        return null;
    }
    for (var i = 0; i < arr.length; i++) {
        if (arr[i][key] == obj[key]) {
            return arr[i];
        }
    }
    return null;
}
function assignObject() {
    var resObj = {};
    for (var i = 0; i < arguments.length; i += 1) {
        var obj = arguments[i],
            keys = Object.keys(obj);
        for (var j = 0; j < keys.length; j += 1) {
            resObj[keys[j]] = obj[keys[j]];
        }
    }
    return resObj;
}
if (typeof Object.assign != 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
        value: function assign(target, varArgs) { // .length of function is 2
            'use strict';
            if (target == null) { // TypeError if undefined or null
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource != null) { // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
        writable: true,
        configurable: true
    });
}

