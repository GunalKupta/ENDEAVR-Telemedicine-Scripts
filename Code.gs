/*
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

let drwong = {
  name:'Dr. Wong', 
  email:'thwong@ihealth.clinic', 
  destinationUrl:'https://docs.google.com/spreadsheets/d/1_zoAkD7FvOGkiLZqOp4ghUd5xg5jIEZOZQoWr2GCl_U/edit?usp=sharing',
  rddUrl:'https://drive.google.com/drive/folders/1dG2oi6rOHJSZz1J8iiWGk1Z0VQFODWhH?usp=sharing',
  destinationId:'1_zoAkD7FvOGkiLZqOp4ghUd5xg5jIEZOZQoWr2GCl_U',
  rddId:'1dG2oi6rOHJSZz1J8iiWGk1Z0VQFODWhH'
  };

let drcolon = {
  name:'Dr. Colon', 
  email:'drcolon@endeavr.city', 
  destinationUrl:'https://docs.google.com/spreadsheets/d/1RrRtxDHAhi4lOh1OugugXwIr5pzT5RY0d3JJwIfvL5o/edit?usp=sharing',
  rddUrl:'https://drive.google.com/drive/folders/10DzuXKihazo-oq0Cs-ccHHhD2bDFniIu?usp=sharing',
  destinationId:'1RrRtxDHAhi4lOh1OugugXwIr5pzT5RY0d3JJwIfvL5o',
  rddId:'10DzuXKihazo-oq0Cs-ccHHhD2bDFniIu'
  };

let kunal = {
  name:'Kunal', 
  email:'kgupta@endeavr.city', 
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


function createHTMLBody(meetingURL, patientResponses) {

  var output = "<HTML><BODY><P style=\"font-family:'Times New Roman';font-size:18px\">"
  + "Hello " + doctor.name + ",<BR><BR>"
  + "An ENDEAVRide patient (<B>" + patientResponses[1] + "</B>) is waiting for your appointment to begin <B><U>immediately</U></B>. Please see the patient using the following link:<BR><BR>"
  + "<A target=_blank href=\"" + meetingURL + "\">" + meetingURL + "</A><BR><BR>"
  + "Please visit the following link to access the <B>patient’s intake form data</B> including vital signs and symptom descriptions. Please make sure you are signed in to <B>" + doctor.email + "</B> in order to access it:<BR><BR>"
  + "<A target=_blank href=\"" + doctor.destinationUrl + "\">" + doctor.destinationUrl + "</A><BR><BR>"
  + "While you are seeing the patient, you can perform <B>remote diagnostics</B> using ENDEAVRide devices such as the digital throatscope, otoscope, and stethoscope. These data can be accessed instantly during the session from the following link:<BR><BR>"
  + "<A target=_blank href=\"" + doctor.rddUrl + "\">" + doctor.rddUrl + "</A><BR><BR>"
  + "If you run into any problems, please call 1-844-ENDEAVR (363-3287).<BR><BR>"
  + "Thanks,<BR>ENDEAVRide<BR>Self-Driving Service of, by, for the people<BR><BR>"
  + '<img src="cid:image">'
  + "</P></BODY></HTML>";

  return output;
}





