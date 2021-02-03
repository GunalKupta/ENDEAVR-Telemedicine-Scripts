// Scripts for ENDEAVR Booth

// Script properties store booth meeting url, updated daily
var props = PropertiesService.getScriptProperties();
var assistantEmails = [{"email": "acooper@endeavr.city"}, {"email": "nmanoj@endeavr.city"}, {"email": "samina@endeavr.city"}];
let endeavrBooth = 'booth@endeavr.city';
var permanentBoothStaff = assistantEmails.concat({"email": endeavrBooth});

let calendarId = 'primary';


function doGet() {
  return HtmlService.createHtmlOutputFromFile('Kiosk');
}

function getMeetingUrl() {
  // returns meeting URL for HTML kiosk
  var url = props.getProperty('meetingUrl');
  console.log("Returning meeting url: " + url)
  return url;
}

function createBoothMeeting() {
  // Runs automatically every morning, creating a new meeting URL each day for security
  var d = new Date();
  
  console.log("creating new Booth meeting " + d);

  var startDate = new Date(d.toLocaleDateString());
  startDate.setHours(6);
  var start = startDate.toJSON(); // date readable by Google Calendar

  var endDate = new Date(d.toLocaleDateString());
  endDate.setHours(18);
  var end = endDate.toJSON();

  try {
    
    var payload = {
      "calendarId": calendarId,
      "conferenceDataVersion": 1,
      "maxAttendees": 10,
      "summary": 'ENDEAVRide Telemedicine Booth - ' + d.toLocaleDateString(),
      "description": 'All Telemedicine Visits on this day for ENDEAVRide Patients in the Booth will occur through this Meet call'
        + '\nWhile you are seeing the patient, you can perform remote diagnostics using ENDEAVRide devices such as the digital throatscope, otoscope, and stethoscope. These data can be accessed during the session from your RDD Folder.\nSee email for more details.',
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
      "transparency": "transparent",

      "attendees": permanentBoothStaff
    }
    
    
    //Create Google Meet Meeting
    const args = { "conferenceDataVersion": 1 }
    
    const response = Calendar.Events.insert(payload, calendarId, args)
    console.log("Success! " + response)
    var meetingUrl = response.conferenceData.entryPoints[0].uri;
    console.log("New calendar event ID: " + response.id);
    console.log("New Booth meeting created: " + meetingUrl);
    
    props.setProperties({'meetingUrl': meetingUrl, 'eventId': response.id});

  } catch(e) {
    console.log("Oh no: " + e.message);
  }
}

function addDoctorToBooth() {
  // Add doctor's email as a guest to the booth Meet call whenever a booth patient requests that doctor
  console.log("Adding " + doctor.name + " to Booth Meet");
  var newAttendees = permanentBoothStaff.concat({"email": doctor.email});
  var resource = { attendees: newAttendees };
  Calendar.Events.patch(resource, calendarId, props.getProperty('eventId'));
  console.log("New Booth attendees: " + Calendar.Events.get(calendarId, props.getProperty('eventId')).attendees);
}

function sendBoothMail(patientResponses) {
  let meetingURL = props.getProperty('meetingUrl');

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
  console.log("Booth appointment email sent to doctor");
}





