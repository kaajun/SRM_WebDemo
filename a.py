import sys, os
from flask import Flask,render_template,request, redirect, Response, url_for
import random, json
import numpy as np
import pandas as pd
import json
import random
import time

PREDICTION = ''
path = "ENROLLMENT"
enrollment_file = os.listdir(path)
UNIQUE_SPEAKER_LIST = [ s.split("_")[-1].split(".")[0] for s in enrollment_file]

app = Flask(__name__)

app.config.update({
		"STORAGE_PROVIDER": "LOCAL", # Can also be S3, GOOGLE_STORAGE, etc... 
		"STORAGE_KEY": "",
		"STORAGE_SECRET": "",
		"STORAGE_CONTAINER": "./",  # a directory path for local, bucket name of cloud
		"STORAGE_SERVER": True,
		"STORAGE_SERVER_URL": "/files" # The url endpoint to access files on LOCAL provider
	})
	
	# Setup storage
def GenerateResult ():
    return random.choice(UNIQUE_SPEAKER_LIST)


@app.route("/")
def output():
    global UNIQUE_SPEAKER_LIST
    return render_template("frontpage.html",usn=UNIQUE_SPEAKER_LIST,len=len(UNIQUE_SPEAKER_LIST))

#to return any data to webpage

@app.route("/receiver",methods = ["POST"])
def worker():
    # read json and reply
    data = request.get_json(force=True)
    result_hah = ''
    for item in data:
        result_hah += str(item['make']) + '\n'
    return result_hah

@app.route("/updatelist",methods=['POST'])
def update_list():
    global UNIQUE_SPEAKER_LIST
    unique_speaker_name = request.get_json(force=True)
    usn = [str(r) for r in unique_speaker_name]
    UNIQUE_SPEAKER_LIST = usn
    print(usn)
    print(type(usn))
    return "Latest Speaker is "+usn[-1]

@app.route("/enrollment",methods=['POST'])
def new_enrollment():
    global UNIQUE_SPEAKER_LIST
    newSpeaker = UNIQUE_SPEAKER_LIST[-1]
    f = open("enrollment-container.wav", "wb")
    _data = request.data
    f.write(_data)
    f.close()
    import soundfile as sf
    wav, fs = sf.read("enrollment-container.wav")
    sf.write("ENROLLMENT/enrollment_"+newSpeaker+".wav", wav, fs)
    return "Binary message written"

@app.route("/delete_enrollment",methods=['POST'])
def delete_enrollment():
    global UNIQUE_SPEAKER_LIST
    _speaker_to_delete = request.get_json(force=True)
    _speaker_to_delete = str(_speaker_to_delete)
    os.remove("ENROLLMENT/enrollment_"+_speaker_to_delete+".wav")
    path = "ENROLLMENT"
    enrollment_file = os.listdir(path)
    if not(("enrollment_"+_speaker_to_delete+".wav") in enrollment_file):
        print(_speaker_to_delete+" enrollment is deleted!")
        UNIQUE_SPEAKER_LIST = [ s.split("_")[-1].split(".")[0] for s in enrollment_file]
    else :
        print("something went wrong please check!")
    return "enrolllment deleted."

@app.route("/test_fetch",methods=['POST'])
def new_test():
    global UNIQUE_SPEAKER_LIST
    global PREDICTION
    from time import gmtime,strftime,localtime
    import random
    timestamp = strftime("%Y-%m-%d_%H:%M:%S", localtime())
    _data = request.data
    f = open("test-container.wav", "wb")
    f.write(_data)
    f.close()
    import soundfile as sf
    wav, fs = sf.read("test-container.wav")
    sf.write("TEST/test_"+timestamp+".wav", wav, fs)
    PREDICTION = GenerateResult()
    return json.dumps({'prediction':PREDICTION}), 200, {'ContentType':'application/json'} 

@app.route("/enrollment_upload",methods=['POST'])
def enrolllment_upload():
    global UNIQUE_SPEAKER_LIST
    newSpeaker = UNIQUE_SPEAKER_LIST[-1]
    f = open("enrollment-container.wav", "wb")
    _data = request.data
    f.write(_data)
    f.close()
    import soundfile as sf
    wav, fs = sf.read("enrollment-container.wav")
    sf.write("ENROLLMENT/enrollment_"+newSpeaker+".wav", wav, fs)
    return "Binary message written"


if __name__ == "__main__":
    app.debug = True
    app.run(host="10.80.43.70")
