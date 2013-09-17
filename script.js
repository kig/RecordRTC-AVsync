function getByID(id) {
	return document.getElementById(id);
}

var recordVideo = getByID('record-video'),
	stopRecordingVideo = getByID('stop-recording-video'),
	playbackButton = getByID('playback');

var video = getByID('video');
var pvideo = getByID('pvideo');
var paudio = getByID('paudio');

var videoConstraints = {
	audio: true,
	video: {
		mandatory: { },
		optional: []
	}
};

var audioConstraints = {
	audio: true,
	video: false
};

var audioStream;
var recorder;
var audioRecorder;

var screen_constraints;

function isCaptureScreen() {
	return;
	if (document.getElementById('record-screen').checked) {
		screen_constraints = {
			mandatory: { chromeMediaSource: 'screen' },
			optional: []
		};
		videoConstraints.video = screen_constraints;
	}
}

recordVideo.onclick = function() {
	isCaptureScreen();
	recordVideoStream();
};

function recordVideoStream() {
	navigator.getUserMedia(videoConstraints, function(stream) {
		video.src = URL.createObjectURL(stream);

		video.width = 320;
		video.height = 240;

		var options = {
			type: 'video',
			video: {
				width: 320,
				height: 240
			},
			canvas: {
				width: 320,
				height: 240
			}
		};

		recorder = window.RecordRTC(stream, options);
		recorder.startRecording();

		if (window.IsChrome) audioStream = new window.MediaStream(stream.getAudioTracks());

		// "audio" is a default type
		audioRecorder = window.RecordRTC(audioStream, {
			type: 'audio'
		});
		audioRecorder.startRecording();

	}, function() {
		alert('Webcam access is denied.');
	});

	recordVideo.disabled = true;
	stopRecordingVideo.disabled = false;
}

stopRecordingVideo.onclick = function() {
	this.disabled = true;
	recordVideo.disabled = false;

	if (recorder) {
		recorder.stopRecording(function(videoUrl) {
			pvideo.src = videoUrl;
			if (audioRecorder) {
				audioRecorder.stopRecording(function(audioUrl) {
					paudio.src = audioUrl;
					playbackButton.style.display = 'inline-block';
				});
			}
		});
	}

};

playbackButton.style.display = 'none';
paudio.style.display = 'none';
playbackButton.onclick = function() {
	pvideo.play();
	paudio.play();
};

pvideo.addEventListener('progress', function() {
	if (Math.abs(paudio.currentTime - this.currentTime) > 0.33) {
		paudio.currentTime = this.currentTime;
	}
}, false);

