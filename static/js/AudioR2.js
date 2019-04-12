var uniqueSpeakerList = [];
var newSpeaker;
var recodingSwitch = false;


function fromJS() {
    alert("Success!")
}

function updateSpeakerlist(newSpeaker){
    uniqueSpeakerList.push(newSpeaker)
    $.post("updatelist",JSON.stringify(uniqueSpeakerList),function(){});
    $.ajaxSetup ({contentType:"application/json;charset=ASCII"});
}

function checkUniqueName() {
    var newName = document.getElementById("speaker_name2").value;
    if (uniqueSpeakerList.includes(newName))
    {
        document.getElementById("name_exist_error").innerHTML = "Speaker already exist, please use others!";
        document.getElementById("recordbutton").disabled = true;
        
    }
    else
    {
        document.getElementById("name_exist_error").innerHTML = "";
        document.getElementById("recordbutton").disabled = false;
        newSpeaker = newName;
        return newSpeaker
    }
}



//recordButton.addEventListener("click",startRecording);
//stopButton.addEventListener("click",stopRecording);
var allChuncks = [];
var recorder,recordButton,stopButton;

function startRecording() {

    updateSpeakerlist(newSpeaker);
    
    recordButton.disabled=true;
    stopButton.disabled = false;

    console.log("Record Button Clicked!");

    recorder.start();
}

function stopRecording() {

    recordButton.disabled = true;
    stopButton.disabled = true;
    
    console.log("Stop Button CLicked!");

    recorder.stop();

}

window.onload = function () {
    recordButton = document.getElementById("recordbutton");
    stopButton = document.getElementById("stopbutton");

    navigator.mediaDevices.getUserMedia({
        audio: true
    }).then(function(stream){
        recordButton.addEventListener('click',startRecording);
        stopButton.addEventListener('click',stopRecording);

        var audioContext = new window.AudioContext();

        var inputNode = audioContext.createMediaStreamSource(stream);
        var outputNode = 
        audioContext.createMediaStreamDestination();

        recorder = new MediaRecorder(stream);

        recorder.addEventListener('dataavailable',function(evt){
            updateAudio(evt.data);
            //allChuncks.push(evt.data);
        })
    })
}

function updateAudio (blob) {
    //var soundBlob = new Blob (allChuncks, {'type':'audio/wav; codecs=MS_PCM'});
    var audio = document.getElementById('audio');
    audio.src = URL.createObjectURL(blob);

    var link = document.createElement('a');
    var downloadURL = window.URL.createObjectURL(blob);
    link.href = downloadURL;
    link.download = newSpeaker+'-enrollment.wav';

    document.body.appendChild(link);
    link.click();
    
    // var fileType = 'audio';
    // var fileName = newSpeaker;
    // var fd = new FormData();
    // fd.append(fileType,blob,fileName);
    // $.ajax({
    //     type: 'POST',
    //     url: '/enrollment',
    //     data: fd, 
    //     cache: false,
    //     processData: false,
    //     contentType: false  
    // }).done(function(data) {
    //     console.log(data);
    // });
    console.log(blob)
    fetch("/enrollment",{
        method:"post",
        body:blob
    });
}

