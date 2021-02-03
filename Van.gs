// Scripts for ENDEAVRide Van

function createMeeting(patientResponses) {
  // Create a new Google Meet for patient and doctor to have an appointment in the van
  var d = new Date();
  
  console.log("creating new Van meeting " + d);
  
  let appointmentLength = 60; // minutes
  
  var start = d.toJSON();
  var endTime = d.getTime() + appointmentLength * 60000;
  var d2 = new Date(endTime);
  var end = d2.toJSON(); // date readable by Google Calendar

  // Each doctor has their own sheet with their own patients, as well as an RDD folder for real-time vitals to be shared
  var dataFile = DriveApp.getFileById(doctor.destinationId);
  var rddFolder = DriveApp.getFileById(doctor.rddId);

  try {
    
    var payload = {
      "calendarId": "primary",
      "conferenceDataVersion": 1,
      "maxAttendees": 10,
      "sendUpdates": "all",
      "summary": 'ENDEAVRide Telemedicine ' + patientResponses[1].substring(0,3).toUpperCase() + ' - ' + doctor.name,
      "description": 'Telemedicine Visit with New ENDEAVRide Patient\nCheck email for more information.\n'
        + 'Patient Intake Data:\n' + doctor.destinationUrl
        + '\nWhile you are seeing the patient, you can perform remote diagnostics using ENDEAVRide devices such as the digital throatscope, otoscope, and stethoscope. These data can be accessed instantly during the session from the following link:\n' + doctor.rddUrl,
      "end": {
        "dateTime": end,  
        "timeZone": "America/Chicago"
      },
      "start": {
        "dateTime": start,
        "timeZone": "America/Chicago" //Los_Angeles, New_York
      },
      "conferenceData": {
        "createRequest": {
          "conferenceSolutionKey": {
            "type": "hangoutsMeet"
          },
          "requestId": "req" + d    //this needs to be unique on every request!
        }
      },
      "attachments":[
        {fileId: doctor.destinationId, fileUrl: dataFile.getUrl(), mimeType: dataFile.getMimeType(), title: dataFile.getName()},
        {fileId: doctor.rddId, fileUrl: rddFolder.getUrl(), mimeType: rddFolder.getMimeType(), title: rddFolder.getName()}
        ],

      "attendees": [{"email": doctor.email},{"email": endeavrPatient}]
    }
    
    
    //Create Google Meet Meeting
    const args = { "conferenceDataVersion": 1, supportsAttachments: true }
    
    const response = Calendar.Events.insert(payload, "primary", args)
    console.log("Success! " + response)
    var meetingUrl = response.conferenceData.entryPoints[0].uri;
    console.log("New meeting created: " + meetingUrl);
    
    return meetingUrl;
  
  } catch(e) {
    console.log("Oh no: " + e.message);
  }
}


function sendVanMail(meetingURL, patientResponses) {
  /*
  Send a formatted email to the doctor to inform them that a patient is ready,
  as well as providing them with the meeting link and their doctor-specific
  Patient sheet and RDD folder
  */
  let htmlbody = createHTMLBody(meetingURL, patientResponses);

  var ImageBlob = UrlFetchApp.fetch("https://endeavr.city/wp-content/uploads/2020/03/ENDEAVRide-1024x234.png").getBlob().setName(ImageBlob);

  GmailApp.sendEmail(doctor.email, "ENDEAVRide Telemedicine Appointment is Ready! (PHI Enclosed)",
                    "Hello " + doctor.name + ",\n\n"
                    + "An ENDEAVRide patient (" + patientResponses[1] + ") is waiting for your appointment to begin immediately. Please see the patient using the following link:\n\n"
                    + meetingURL + "\n\n"
                    + "Please visit the following link to access the patient’s intake form data including vital signs and symptom descriptions. Please make sure you are signed in to " + doctor.email + " in order to access it:\n\n"
                    + doctor.destinationUrl + "\n\n"
                    + "While you are seeing the patient, you can perform remote diagnostics using ENDEAVRide devices such as the digital throatscope, otoscope, and stethoscope. These data can be accessed instantly during the session from the following link:\n\n"
                    + doctor.rddUrl + "\n\n"
                    + "Thanks,\nENDEAVRide\nSelf-Driving Service of, by, for the people\n\n",
                    {htmlBody: htmlbody, inLineImages: {image: ImageBlob}, name:'ENDEAVR Institute', bcc:endeavrEmail}
                   );
  console.log("Van appointment email sent to doctor");
}




