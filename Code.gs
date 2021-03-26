/*
This script was created by Kunal Gupta for ENDEAVR and its subsidiary ENDEAVRide,
to automate the telemedicine process for users of the autonomous telemedicine van
and telemedicine booth located in Nolanville, TX.
*/

/*
Form responses:
B: Patient name
C: Birth date
D: Doctor
E-K: Vitals
L-N: Medications and Kidney/Liver
O-W: Problems
*/

// thwong@ihealth.clinic
// drcolon@killeenneurocenter.com
// drcolon@endeavr.city
// kgupta@endeavr.city

let doctorSelectionColumn = 7; // Column H contains doctor selection

// Doctor classes
let drwong = {
  name:'Dr. Wong', 
  email:'thwong@ihealth.clinic', 
  phone:'5124617383@mms.att.net',   // UPDATE
  destinationUrl:'https://docs.google.com/spreadsheets/d/1_zoAkD7FvOGkiLZqOp4ghUd5xg5jIEZOZQoWr2GCl_U/edit?usp=sharing',
  rddUrl:'https://drive.google.com/drive/folders/1dG2oi6rOHJSZz1J8iiWGk1Z0VQFODWhH?usp=sharing',
  destinationId:'1_zoAkD7FvOGkiLZqOp4ghUd5xg5jIEZOZQoWr2GCl_U',
  rddId:'1dG2oi6rOHJSZz1J8iiWGk1Z0VQFODWhH'
  };

let drcolon = {
  name:'Dr. Colon', 
  email:'drcolon@endeavr.city', 
  phone:'5124617383@mms.att.net',   // UPDATE
  destinationUrl:'https://docs.google.com/spreadsheets/d/1RrRtxDHAhi4lOh1OugugXwIr5pzT5RY0d3JJwIfvL5o/edit?usp=sharing',
  rddUrl:'https://drive.google.com/drive/folders/10DzuXKihazo-oq0Cs-ccHHhD2bDFniIu?usp=sharing',
  destinationId:'1RrRtxDHAhi4lOh1OugugXwIr5pzT5RY0d3JJwIfvL5o',
  rddId:'10DzuXKihazo-oq0Cs-ccHHhD2bDFniIu'
  };

// Default doctor value for testing
let kunal = {
  name:'Kunal', 
  email:'kgupta@endeavr.city', 
  phone:'5124617383@mms.att.net',
  destinationUrl:'https://docs.google.com/spreadsheets/d/1AbRpmvtk4WeUxwo4-3IR0EHUKo4CHMNY8fLK7N-KGMk/edit?usp=sharing',
  rddUrl:'https://drive.google.com/drive/folders/1kltR_6r3FZ_9cnBKlKMbwXCBdS8ePYXH?usp=sharing',
  destinationId:'1AbRpmvtk4WeUxwo4-3IR0EHUKo4CHMNY8fLK7N-KGMk',
  rddId:'1kltR_6r3FZ_9cnBKlKMbwXCBdS8ePYXH'
  };

let endeavrEmail = 'ride@endeavr.city';
let endeavrPatient = 'patient@endeavr.city';

var doctor = kunal;

var ss = SpreadsheetApp.getActiveSpreadsheet();

function onFormSubmit(e){
  Utilities.sleep(1000);
  console.log("onFormSubmit called");
  /*
  When a form is submitted:
    1. Determine which doctor they selected
    2. Copy the form responses (containing PHI) into the sheet that is shared with that doctor
    3. Determine whether the patient is in the van or the booth
      a. If in van, create a new Google Meet and send a formatted email to the doctor
      b. If in booth, add the doctor to the already created Google Meet call and send a formatted email to them
  */
  
  var values = e.values;
  
  chooseDoctor(values[doctorSelectionColumn]);
  copyData();

  var sheetName = ss.getActiveSheet().getName();
  var meetingUrl;

  if (sheetName == 'Van Patients') {
    meetingUrl = createMeeting(values);
    sendVanMail(meetingUrl, values);
  }
  else if (sheetName == 'Booth Patients') {
    addDoctorToBooth();
    sendBoothMail(values);
  }
  else {
    throw 'No active sheet found';
  }

  console.log("onFormSubmit complete");
}

function chooseDoctor(selection) {
  // sets doctor variable to appropriate doctor depending on selection made in values[3]

  if (selection) {
    if (selection.includes('Wong')) {
      doctor = drwong;
    } else if (selection.includes('Colon')) {
      doctor = drcolon;    
    } else {
      doctor = kunal;
    }
  }

  console.log(doctor.name + ' was selected');
}

function copyData() {
  // Copies the most recently submitted data into separate spreadsheet shared with appropriate doctor

  var sourceRange = ss.getActiveSheet().getActiveRange();
  var sourceValues = sourceRange.getValues();

  var numValues = sourceValues[0].length;

  let destination = SpreadsheetApp.openByUrl(doctor.destinationUrl).getActiveSheet();
  var last_row = destination.getLastRow();
  destination.insertRowAfter(last_row);
  let destRange = destination.getRange(last_row+1,1,1,numValues);

  destRange.setValues(sourceValues);

  console.log('Data copied into sheet shared with ' + doctor.name);
}







