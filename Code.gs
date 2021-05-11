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

var allDoctors = [];

class Doctor {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    allDoctors.push(this);
  }

  getName() {
    var words = this.name.split(' ');
    return "Dr. " + words[words.length-1];
  }
}
class EndeavrDoctor extends Doctor {
  constructor(obj) {
    super(obj.name, obj.email);
    Object.assign(this, obj);
  }
}

// Doctor classes
let drwong = new EndeavrDoctor({
  name:'Timothy Wong', 
  email:'thwong@ihealth.clinic', 
  destinationUrl:'https://docs.google.com/spreadsheets/d/1_zoAkD7FvOGkiLZqOp4ghUd5xg5jIEZOZQoWr2GCl_U/edit?usp=sharing',
  rddUrl:'https://drive.google.com/drive/folders/1dG2oi6rOHJSZz1J8iiWGk1Z0VQFODWhH?usp=sharing',
  destinationId:'1_zoAkD7FvOGkiLZqOp4ghUd5xg5jIEZOZQoWr2GCl_U',
  rddId:'1dG2oi6rOHJSZz1J8iiWGk1Z0VQFODWhH'
  });

let drcolon = new EndeavrDoctor({
  name:'Hector Colon', 
  email:'drcolon@endeavr.city', 
  destinationUrl:'https://docs.google.com/spreadsheets/d/1RrRtxDHAhi4lOh1OugugXwIr5pzT5RY0d3JJwIfvL5o/edit?usp=sharing',
  rddUrl:'https://drive.google.com/drive/folders/10DzuXKihazo-oq0Cs-ccHHhD2bDFniIu?usp=sharing',
  destinationId:'1RrRtxDHAhi4lOh1OugugXwIr5pzT5RY0d3JJwIfvL5o',
  rddId:'10DzuXKihazo-oq0Cs-ccHHhD2bDFniIu'
  });

// Default doctor value for testing
let kunal = new EndeavrDoctor({
  name:'Kunal Gupta', 
  email:'kgupta@endeavr.city', 
  destinationUrl:'https://docs.google.com/spreadsheets/d/1AbRpmvtk4WeUxwo4-3IR0EHUKo4CHMNY8fLK7N-KGMk/edit?usp=sharing',
  rddUrl:'https://drive.google.com/drive/folders/1kltR_6r3FZ_9cnBKlKMbwXCBdS8ePYXH?usp=sharing',
  destinationId:'1AbRpmvtk4WeUxwo4-3IR0EHUKo4CHMNY8fLK7N-KGMk',
  rddId:'1kltR_6r3FZ_9cnBKlKMbwXCBdS8ePYXH'
  });


let endeavrEmail = 'ride@endeavr.city';
let endeavrPatient = 'patient@endeavr.city';

var doctor = kunal;

var htmlEmailSignature = "Thank you for your service!<BR>ENDEAVR Telemedicine Team<BR>" + '<A href="https://endeavr.city" target="_blank"><img src="cid:image" style=\'width:280px\'></A><BR>'

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
  if (!doctor) {
    throw "No doctor selected";
  }
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
    } else if (selection.includes('Gupta')){
      doctor = kunal;
    } else {
      doctor = null;
    }
  }

  console.log(doctor.getName() + ' was selected');
}

function copyData() {
  // Copies the most recently submitted data into separate spreadsheet shared with appropriate doctor

  var sourceRange = ss.getActiveSheet().getActiveRange();
  var sourceValues = sourceRange.getValues();

  // var numValues = sourceValues[0].length;

  let destination = SpreadsheetApp.openByUrl(doctor.destinationUrl).getActiveSheet();
  // var last_row = destination.getLastRow();
  // destination.insertRowAfter(last_row);
  // let destRange = destination.getRange(last_row+1,1,1,numValues);
  // destRange.setValues(sourceValues);

  destination.appendRow(sourceValues[0]);

  console.log('Data copied into sheet shared with ' + doctor.getName());
}

var weekday=new Array(7);
weekday[0]="Sunday";
weekday[1]="Monday";
weekday[2]="Tuesday";
weekday[3]="Wednesday";
weekday[4]="Thursday";
weekday[5]="Friday";
weekday[6]="Saturday";

var month=new Array(12);
month[0]="January";
month[1]="February";
month[2]="March";
month[3]="April";
month[4]="May";
month[5]="June";
month[6]="July";
month[7]="August";
month[8]="September";
month[9]="October";
month[10]="November";
month[11]="December";




