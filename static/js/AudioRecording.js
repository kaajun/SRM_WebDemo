var uniqueSpeakerList = JSON.parse(document.getElementById("enrolled_speaker").getAttribute('data-list'));

URL = window.URL || window.webkitURL;
var gumStream;
var testGumStream;
var rec;
var testRec;
var input;
var testInput;

var AudioContext = window.AudioContext;
var testAudioContext = window.AudioContext;
var audioContext;
var testaudioContext;

var delButtons = document.getElementsByClassName("del-button");
var recordButton = document.getElementById("recordbutton");
var stopButton = document.getElementById("stopbutton");
var testRecordButton = document.getElementById("test-record-button");
var testStopButton = document.getElementById("test-stop-button");
var uploadEnrollButton = document.getElementById("enroll-upload-button");
var uploadTestButton = document.getElementById("test-upload-button");
var chooseEnrollUpload = document.getElementById("enroll-choose-file");
var chooseTestUpload = document.getElementById("test-choose-file");

console.log(uniqueSpeakerList);
var enrollmentTable;
var enrollmentLength = Object.keys(uniqueSpeakerList).length;

var newSpeaker;
var recodingSwitch = false;
var wavEnrollUploaded;
var wavTestUploaded;

function fromJS() {
    alert("Success!")
};

function updateSpeakerlistFLASK(){
    $.post("updatelist",JSON.stringify(uniqueSpeakerList),function(){});
    $.ajaxSetup ({contentType:"application/json;charset=ASCII"});
};


function checkUniqueName() {
    var newName = document.getElementById("speaker_name2").value;
    if (newName.length == 0 || newName == "" || newName == null) {
        chooseEnrollUpload.disabled = true;
        recordButton.disabled = true;
    }
    if (uniqueSpeakerList.includes(newName))
    {
        document.getElementById("name_exist_error").innerHTML = "Speaker already exist, please use others!";
        document.getElementById("recordbutton").disabled = true;
        chooseEnrollUpload.disabled = true;
    }
    else
    {
        document.getElementById("name_exist_error").innerHTML = "";
        document.getElementById("recordbutton").disabled = false;
        chooseEnrollUpload.disabled = false;
        newSpeaker = newName;
        return newSpeaker
    };
};

if (recordButton) {
    recordButton.addEventListener('click',startRecording);
};
if (stopButton) {
    stopButton.addEventListener('click',stopRecording);
};
if (testRecordButton) {
    testRecordButton.addEventListener('click',testStartRecording);
};
if (testStopButton) {
    testStopButton.addEventListener('click',testStopRecording);
};

chooseEnrollUpload.onchange = function () {
    uploadEnrollButton.disabled = false;
    wavEnrollUploaded = chooseEnrollUpload.files[0];
    console.log(wavEnrollUploaded);
};

chooseTestUpload.onchange = function () {
    uploadTestButton.disabled = false;
    wavTestUploaded = chooseTestUpload.files[0];
    console.log(wavTestUploaded);
};

if (uploadEnrollButton) {
    uploadEnrollButton.addEventListener('click',uploadEnrollment);
};

if (uploadTestButton) {
    uploadTestButton.addEventListener('click',uploadTest);
};

function startRecording() {
    
    recordButton.disabled=true;
    stopButton.disabled = false;

    console.log("Record Button Clicked!");

    var constraints ={audio : true, video: false};

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream){
        console.log("getUserMedia() success, stream created, initializing Recorder.js ...");
        audioContext = new AudioContext();
        gumStream = stream;
        input = audioContext.createMediaStreamSource(stream);
        rec = new Recorder(input, {numChannels:1});
        rec.record();
        console.log("Recording Started!");
    }).catch(function(err){
        recordButton.disabled = true;
        stopButton.disabled = true;
        console.log("Error!");
    });
};

function testStartRecording() {

    testRecordButton.disabled=true;
    testStopButton.disabled = false;
    console.log("Test record button clicked!");
    if (document.contains(document.getElementById("test-audio"))) {
        document.getElementById("test-audio").remove();
        document.getElementById("test-result").innerHTML="";
    }
    var constraints ={audio : true, video: false};
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream){
        console.log("getUserMedia() success, stream created, initializing Recorder.js ...");
        testaudioContext = new testAudioContext();
        testGumStream = stream;
        testInput = testaudioContext.createMediaStreamSource(stream);
        testRec = new Recorder(testInput, {numChannels:1});
        testRec.record();
        console.log("Test Recording Started!");
    }).catch(function(err){
        testRecordButton.disabled = false;
        testStopButton.disabled = true;
        console.log("Test Error!");
    });
};

function stopRecording() {
    recordButton.disabled = true;
    stopButton.disabled = true;
    console.log("Stop Button CLicked!");
    rec.stop();
    gumStream.getAudioTracks()[0].stop();
    rec.exportWAV(passToFlask);
    uniqueSpeakerList.push(newSpeaker);
    enrollmentLength = Object.keys(uniqueSpeakerList).length;
    updateSpeakerlistFLASK();
    addEnrollment();
    console.log('updated list : '+uniqueSpeakerList);
};

function testStopRecording() {
    testStopButton.disabled = true;
    console.log("Test Stop Button CLicked!");
    testRec.stop();
    testGumStream.getAudioTracks()[0].stop();
    testRec.exportWAV(createTestAudio);
    testRec.exportWAV(passToFlaskTest);
};

function passToFlask(blob) {
    console.log(blob)
    fetch("/enrollment", {
        method:"post",
        body:blob
    });
};

function passToFlaskTest(blob) {
    console.log(blob);
    fetch("/test_fetch", {
        method:"post",
        body:blob
    }).then(r => r.json())
    .then(r => {
        var res = document.getElementById("test-result");
        res.appendChild(document.createTextNode(r.prediction));
        testRecordButton.disabled = false;
    });

};

function createTestAudio(blob){
    var divAudio = document.getElementById("p-audio-tag");
    var au = document.createElement("audio");
    var url = URL.createObjectURL(blob);
    au.controls= true;
    au.src = url;
    au.id = 'test-audio';
    divAudio.appendChild(au);
};

function getTable() {
    var rows = Object.keys(uniqueSpeakerList).length;
    console.log(rows);
    var enrollList = document.getElementById("enrolled_speaker"), tbl = document.createElement('table');
    var thead = document.createElement('thead');
    var trh = document.createElement('tr');
    var th1 = document.createElement('th');
    th1.appendChild(document.createTextNode('Listed Enrollment'));
    var th2 = document.createElement('th');
    th2.appendChild(document.createTextNode('Delete Button'));
    trh.appendChild(th1);
    trh.appendChild(th2);
    thead.appendChild(trh);
    var tbdy = document.createElement('tbody');
    for (var r = 0; r< rows; r++) {
        var tr = document.createElement('tr');
        tr.id = uniqueSpeakerList[r];
        var td1 = document.createElement('td');
        td1.appendChild(document.createTextNode(uniqueSpeakerList[r]));
        td1.className = 'speaker-cell';
        var td2 = document.createElement('td');
        td2.align = 'center';
        td2.className = 'del-button-cell';
        var delButton = document.createElement("button");
        delButton.id = uniqueSpeakerList[r]+"-del-button";
        delButton.appendChild(document.createTextNode("delete"));
        delButton.className ='del-button';
        td2.appendChild(delButton);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbdy.appendChild(tr);
    };
    tbl.appendChild(thead);
    tbl.appendChild(tbdy);
    enrollList.appendChild(tbl);
    enrollmentTable = tbdy;

    addDeleteFunction();
};

var promtUserDel = function () {
    var speakerToDelete = this.parentNode.parentNode.getAttribute("id");
    if (confirm("Are you sure you want to delete enrollment of "+speakerToDelete+"?")) {
        console.log("Proceed to delete enrollment of "+speakerToDelete);
        deleteEnrollment(speakerToDelete);
    } else {
    }
};

function addDeleteFunction () {
    
    delButtons = document.getElementsByClassName("del-button");

    if (delButtons) {
        for (var i = 0 ; i < enrollmentLength; i++) {
            delButtons[i].addEventListener('click',promtUserDel, false);
        };
    };
};

function arrayRemove(arr,value) {
    return arr.filter(function(ele) {
        return ele != value;
    });
};

function deleteEnrollment(speakerToDelete) {
    uniqueSpeakerList = arrayRemove(uniqueSpeakerList,speakerToDelete);
    enrollmentLength = Object.keys(uniqueSpeakerList).length;
    for (var j = 0 ; j <enrollmentLength; j++) {
        delButtons[j].disabled = true;
    };
    if (document.contains(document.getElementById(speakerToDelete))) {
        document.getElementById(speakerToDelete).remove();
    };
    updateSpeakerlistFLASK();
    $.post("delete_enrollment",JSON.stringify(speakerToDelete),function(e){
        for (var j = 0 ; j <enrollmentLength; j++) {
            delButtons[j].disabled = false;
        }
    });
    $.ajaxSetup ({contentType:"application/json;charset=ASCII"});
    console.log('updated list : '+uniqueSpeakerList);
};

function addEnrollment() {
    var tr = document.createElement('tr');
    tr.id = newSpeaker;
    var td1 = document.createElement('td');
    td1.appendChild(document.createTextNode(newSpeaker));
    td1.className = 'speaker-cell';
    var td2 = document.createElement('td');
    td2.align = 'center';
    td2.className = 'del-button-cell';
    var delButton = document.createElement("button");
    delButton.id = newSpeaker+"-del-button";
    delButton.appendChild(document.createTextNode("delete"));
    delButton.className ='del-button';
    td2.appendChild(delButton);
    tr.appendChild(td1);
    tr.appendChild(td2);
    enrollmentTable.appendChild(tr);
    delButton.addEventListener('click',promtUserDel,false);
};

function uploadEnrollment () {
    uniqueSpeakerList.push(newSpeaker);
    enrollmentLength = Object.keys(uniqueSpeakerList).length;
    updateSpeakerlistFLASK();
    uploadEnrollButton.disabled = true;
    chooseEnrollUpload.disabled = true;
    fetch("/enrollment_upload", {
        method:"post",
        body:wavEnrollUploaded
    }).then(r => {
        addEnrollment();
        console.log('updated list : '+uniqueSpeakerList);
        if (document.contains(document.getElementById("upload-enroll-audio"))) {
            document.getElementById("upload-enroll-audio").remove();
        };
        createEnrollAudio();
    });
};

function uploadTest () {
    uploadTestButton.disabled = true;
    chooseTestUpload.disabled = true;
    if (document.contains(document.getElementById("test-audio"))) {
        document.getElementById("test-audio").remove();
        document.getElementById("test-result").innerHTML="";
    }
    fetch("/test_fetch", {
        method:"post",
        body:wavTestUploaded
    
    }).then(r => r.json())
    .then(r => {
        var res = document.getElementById("test-result");
        res.appendChild(document.createTextNode(r.prediction));
        createTestAudio(wavTestUploaded);
        chooseTestUpload.disabled = false;
    });
};

function createEnrollAudio(){
    var auEnrollP = document.getElementById("upload-audio-enroll");
    var auEnroll = document.createElement("audio");
    var urlEnroll = URL.createObjectURL(wavEnrollUploaded);
    auEnroll.controls= true;
    auEnroll.src = urlEnroll;
    auEnroll.id = 'upload-enroll-audio';
    auEnrollP.appendChild(auEnroll);
};