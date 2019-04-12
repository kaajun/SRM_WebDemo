var uniqueSpeakerList = [];
var newSpeaker;

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

var recordButton = document.getElementById("recordbutton")
var stopButton = document.getElementById("stopbutton")

if (recordButton) {
    recordButton.addEventListener('click',startRecording);
}

if (stopButton) {
    stopButton.addEventListener('click',stopRecording);
}

var audio = document.querySelector('audio');

function captureMicrophone(callback) {
    //bntReleaseMicrophone.disabled = false;

    if(microphone) {
        callback(microphone);
        return;
    }

    if(typeof navigator.mediaDevices === 'undefined' || !navigator.mediaDevices.getUserMedia) {
        alert('This browser does not supports WebRTC getUserMedia API.');

        if(!!navigator.getUserMedia) {
            alert('This browser seems supporting deprecated getUserMedia API.');
        }
    }

    navigator.mediaDevices.getUserMedia ({
        audio : isEdge ? true : {
            echoCancellation: false
        }
    }).then(function(mic){
        callback(mic);
    }).catch(function(error){
        alert('Unable to capture your microphone. Please check console logs.');
        console.error(error);
    });
}

// function replaceAudio(src) {
//     var newAudio = document.createElement('audio');
//     newAudio.controls = true;
//     newAudio.autoplay = true;

//     if(src) {
//         newAudio.src = src;
//     }

//     var parentNode = audio.parentNode;
//     parentNode.innerHTML = "";
//     parentNode.appendChild(newAudio);

//     audio = newAudio;
// }

function stopRecordingCallback() {
    audio.src = audio.srcObject = null;
    recorder.microphone.stop();
    recorder = null;
}

var isEdge = navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob);

var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

var recorder;
var microphone;
var audioBlobsContainer = document.querySelector('#audio-blobs-container');

var btnStartRecording = document.getElementById('recordbutton');
var btnStopRecording = document.getElementById('stopbutton');
var downloadflag = false;

function startRecording() {
    
    updateSpeakerlist(newSpeaker);
    
    recordButton.disabled=true;
    stopButton.disabled = false;

    console.log("Record Button Clicked!");

    captureMicrophone(function(microphone){
        audio.srcObject = microphone;

        recorder= RecordRTC(microphone, {
            recorderType : StereoAudioRecorder,
            mimeType : 'audio/wav',
            timeSlice : 3000,
            ondataavailable: function(blob) {
                var audio = document.createElement('audio');
                audio.controls = true;
                audio.srcObject = null;
                audio.src = URL.createObjectURL(blob);
                audioBlobsContainer.appendChild(audio);
                audioBlobsContainer.appendChild(document.createElement('hr'));
            }
        });

        recorder.startRecording();
        recorder.microphone = microphone;
    })

    
}

function stopRecording() {

    recordButton.disabled = true;
    stopButton.disabled = true;
    
    console.log("Stop Button CLicked!");

    recorder.stopRecording(stopRecordingCallback);

    console.log("Proceed to download wav");

    downloadWAV();
}

function downloadWAV() {
    //if(!recoder || !recoder.getBlob()) return;

    if(isSafari) {
        recorder.getDataURL(function(dataURL){
            SaveToDisk(dataURL, getFileName('wav'));
        });
        return;
    }

    var blob = recorder.getBlob();
    var file = new File([blob],getFileName('wav'),{
        type:'audio/wav'
    });
    invokeSaveAsDialog(file);
};

function click(el) {
    el.disable = false;
    var evt = document.createEvent("Event");
    evt.initEvent('click',true,true);
    el.dispatchEvent(evt);
}

function getRandomString() {
    if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
        var a = window.crypto.getRandomValues(new Uint32Array(3)),
            token = '';
        for (var i = 0, l = a.length; i < l; i++) {
            token += a[i].toString(36);
        }
        return token;
    } else {
        return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
    }
}

function getFileName(fileExtension) {
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth();
    var date = d.getDate();
    return 'RecordRTC-' + year + month + date + '-' + getRandomString() + '.' + fileExtension;
}

function SaveToDisk(fileURL, fileName) {
    // for non-IE
    if (!window.ActiveXObject) {
        var save = document.createElement('a');
        save.href = fileURL;
        save.download = fileName || 'unknown';
        //save.style = 'display:none;opacity:0;color:transparent;';
        (document.body || document.documentElement).appendChild(save);
        if (typeof save.click === 'function') {
            save.click();
        } else {
            save.target = '_blank';
            var event = document.createEvent('Event');
            event.initEvent('click', true, true);
            save.dispatchEvent(event);
        }
        (window.URL || window.webkitURL).revokeObjectURL(save.href);
    }
    // for IE
    else if (!!window.ActiveXObject && document.execCommand) {
        var _window = window.open(fileURL, '_blank');
        _window.document.close();
        _window.document.execCommand('SaveAs', true, fileName || fileURL)
        _window.close();
    }
}

function passToFlask(blob) {
    var fd = new FormData();
    var soundBLOB = blob;
    fd.append('file',soundBLOB);

    console.log(blob);
    //console.log(form)
    
    $.ajax({
        type: 'POST',
        url: '/enrollment',
        data: fd, 
        cache: false,
        processData: false,
        contentType : false  
    }).done(function(data) {
        console.log(data);
    });

    // console.log(blob);
    // fetch("/enrollment",{
    //     method:"post",
    //     body:blob
    // });
}
