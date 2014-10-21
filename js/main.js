// *** Validation ***
function activateValidation() {
    $("#CarDealer").validationEngine({
        success: function () { $('.save').click(); saveCarDetails(); },
        failure: false
    })
}
function validateSelect() {
    var result = true;
    if ($('#Status').val() == 0) { result = false; }
    return result;
}
// *** END Validation ***

// *** GeoLocation ***
function geoFindLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition,showError);
    } else { 
        document.getElementById('map').innerHTML = "Geolocation is not supported by this browser.";}
}

function showPosition(position) {
    var x = document.getElementById('map');
    if ($('#itemID').val() == 0) {
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        console.log(lat);
        console.log(lon);
    } else {
        car = JSON.parse(localStorage.getItem(localStorage.key($('#itemID').val())));
        lat = car.latitude;
        lon = car.longitude;
    }
    latlon = new google.maps.LatLng(lat, lon)
    mapholder = document.getElementById('map')
    mapholder.style.height='360px';
    mapholder.style.width='365px';

    var myOptions={
    center:latlon,zoom:14,
    mapTypeId:google.maps.MapTypeId.ROADMAP,
    mapTypeControl:false,
    navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL}
    }
    
    var map = new google.maps.Map(document.getElementById("map"),myOptions);
    var marker = new google.maps.Marker({position:latlon,map:map,title:"Вие сте тук!"});
}

function showError(error) {
    var x = document.getElementById('map');
    switch(error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred."
            break;
    }
}
// *** END GeoLocation ***

// *** Popup ***
function showPopup() {
    geoFindLocation();
    $('#DOP').datepicker({ dateFormat: 'dd-M-yy' });
    if ($('#itemID').val() == 0) {
        document.getElementById('popupImage').src = "";
        $('#Picture').val('');
        $('#Make').val('');
        $('#Model').val('');
        $('#DOP').val('');
        $('#Status').val(0);
        $('#RegNumber').val('');
    } else {
        for (var i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i) == $('#itemID').val()) {
                car = JSON.parse(localStorage.getItem(localStorage.key(i)));
                document.getElementById('popupImage').src = 'data:image/png;base64,' + car.picture;
                $('#Picture').val('');
                $('#Make').val(car.make);
                $('#Model').val(car.model);
                $('#DOP').val(car.dop);
                $('#Status').val(car.status);
                $('#RegNumber').val(car.regnumber);
                break;
            }            
        }
    }
}
// *** END Popup ***

// *** Manipulation of CAR object ***
var car = {};
var sorted = false;

function setCarObject() {
    bannerImage = document.getElementById('popupImage');
    car.picture = getBase64Image(bannerImage);
    car.make = $('#Make').val();
    car.model = $('#Model').val();
    car.dop = $('#DOP').val();
    car.status = $('#Status').val();
    car.regnumber = $('#RegNumber').val();
    navigator.geolocation.getCurrentPosition(setPosition);
}

function setPosition(position) {
    car.latitude = position.coords.latitude;
    car.longitude = position.coords.longitude;
}

function saveCarDetails() {
    setCarObject();
    var myID;
    // Create unique ID for the new entries
    if ($('#itemID').val() == 0) {
        var uniqueId = Math.random().toString(36).substr(2, 16);
        myID = uniqueId;
    } else {
        myID = $('#itemID').val();
    }
    car.ID = myID;
    localStorage.setItem(myID, JSON.stringify(car));
    // Refresh the grid
    loadCarDetails();
}

function deleteCarDetails() {
    var r = confirm("Искате ли да изтриете този автомобил?");
    if (r == true) {
        localStorage.removeItem($('#itemID').val());
        // Refresh the grid
        loadCarDetails();
    } 
}

function loadCarDetails() {
    var table = $('.grid tbody');
    $('.grid tbody').html('');
    var available;
    var availableCars, unavailableCars, currentCars;
    if (localStorage.length == 0) {
        table.append('<tr><td colspan="4">Няма въведени данни за авромобили</td></tr>');
    } else {
        for (var i = 0; i < localStorage.length; i++) {
            car = JSON.parse(localStorage.getItem(localStorage.key(i)));
            if (car.status == 1) { available = 'yes'; } else { available = 'no'; }
            currentCar = '<tr>' +
            '<td style="width:170px;"><img id="image-container" src="' + 'data:image/png;base64,' + car.picture + '" /></td>' +
            '<td>' + car.make + ' ' + car.model + '<br /> Дата на производство: ' + car.dop + '<br />' + car.regnumber + '</td>' +
            '<td style="width:100px;"><div class="available ' + available + '"></div></td>' +
            '<td class="right" style="width:40px;">' +
                '<a href="#?w=810" rel="car_popup" class="poplight"><input type="button" class="gridButton edit" title="Редактиране на автомобил" onclick="$(\'a.poplight[href^=#]\').click(); $(\'#itemID\').val(\'' + car.ID + '\'); return showPopup();"/></a>' +
                '<input type="button" title="Изтриване на автомобил" class="gridButton delete" onclick="$(\'#itemID\').val(\'' + car.ID + '\'); return deleteCarDetails();" /></td>' +
        '</tr>';
            if (sorted && car.status == 2) { unavailableCars += currentCar; }
            else { availableCars += currentCar; }
        }
        table.append(availableCars + unavailableCars);
        $('#itemID').val(0);
    }
}
// *** END Manipulation of CAR object ***

// *** Image save and display ***
function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            document.getElementById('popupImage').src = e.target.result;
        }

        reader.readAsDataURL(input.files[0]);
    }
}

function getBase64Image(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}
// *** END Image save and display ***