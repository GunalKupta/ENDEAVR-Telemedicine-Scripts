let boothappointment_calendarid = "c_eitg0t8o7nl6ikhqv1a2asa6jk@group.calendar.google.com";
let vanappointment_calendarid = "c_0t3a67ff4jt3rksnatquk2brc0@group.calendar.google.com";

class Appointment {
  constructor(type, dr, patientName, patientPhone, event, meetUrl) {
    this.type = type;
    this.doctor = dr;   // class Doctor
    this.patient = patientName
    this.patientPhone = patientPhone;
    this.event = event; // class CalendarEvent
    this.url = meetUrl;
  }

  getTitle() {
    return this.event.getTitle();
  }
  getDate() {
    return this.event.getStartTime();
  }

  htmlInfo() {
    var out = this.getTitle().substring(0, this.getTitle().indexOf(' - ')) + "<BR>";
    out += weekday[this.getDate().getDay()] + ", " + month[this.getDate().getMonth()] + " " + this.getDate().getDate();
    out += " at <B>" + this.getDate().toTimeString() + "</B> " + "(" + this.getDate().toLocaleTimeString() + " Texas time).<BR>";
    out += "Patient: " + this.patient + "<BR>";
    out += (this.patientPhone == null) ? "" : "Patient Phone #: " + this.patientPhone + "<BR>";
    out += "Link to join: <A target=_blank href=\"" + this.url + "\">" + this.url + "</A><BR>";
    return out;
  }

  txtInfo() {
    var out = this.getTitle().substring(0, this.getTitle().indexOf(' - ')) + "\n";
    out += weekday[this.getDate().getDay()] + ", " + month[this.getDate().getMonth()] + " " + this.getDate().getDate();
    out += " at " + this.getDate().toTimeString() + " (" + this.getDate().toLocaleTimeString() + " Texas time).\n";
    out += "Patient: " + this.patient + "\n";
    out += (this.patientPhone == null) ? "" : "Patient Phone #: " + this.patientPhone + "\n";
    out += "Link to join: " + this.url + "\n";
    return out;
  }
}

function inDrList(drEmail, drsList) {
  var out = false; 
  // Logger.log("Checking Dr List");
  drsList.forEach(function(dr) {
    // Logger.log(dr.name);
    if (dr.email == drEmail) {
      // Logger.log("Found " + drEmail + " in Dr list");
      out = true;
    }
  });
  return out;
}

function updateAppointmentsForDay() {
  var today = new Date();
  today.setTime(today.getTime() + (1*60*60*1000));  // multiply by num hours to add when testing
  var appointmentsList = [];
  var doctorsList = [];

  // Booth appointments
  var boothCal = CalendarApp.getCalendarById(boothappointment_calendarid);
//  var setmoreCal = CalendarApp.getCalendarById(setmore_calendarid);
  var boothAppointmentsForDay = boothCal.getEventsForDay(today);

  boothMeetingUrl = getBoothMeetingUrl();
  boothMeetingId = boothMeetingUrl.substring(24);
  boothMeetingLabel = boothMeetingUrl.substring(8);
  var count = 0;

  boothAppointmentsForDay.filter(a => a.getTitle().search("For Telemedicine Appointment") > 0).forEach(function(appointment) {
    
    var appointmentTitle = appointment.getTitle();

    var dr = getDoctorFromEvent(appointment);
    var patient = getPatientNameFromEvent(appointment);
    var patientPhone = getPatientPhoneFromEvent(appointment);

    // chooseDoctor(appointmentTitle);
    // var rddFolder = DriveApp.getFileById(doctor.rddId);

    var newStart = new Date(appointment.getStartTime());
    // newStart.setTime(newStart.getTime() + (60*60*1000));
    var newEnd = new Date(appointment.getEndTime());
    // newEnd.setTime(newEnd.getTime() + (60*60*1000));
    var desc = appointment.getDescription();
    var newDesc = 'Scheduled Telemedicine Visit with ENDEAVR Patient.\n\nAPPOINTMENT DETAILS\n'
        + desc.substring(desc.indexOf('PROVIDER:')).replace('\n\n\n\n\n\n\n', '\n\n');

    var payload = { 
      "summary": "ENDEAVR Telemedicine Booth Appointment - " + dr.getName(),
      "description": newDesc,
      "sendUpdates": "all",
      "calendarId": boothappointment_calendarid,
      "end": {
        "dateTime": newEnd.toJSON(),  
        "timeZone": "America/Chicago"
      },
      "start": {
        "dateTime": newStart.toJSON(),
        "timeZone": "America/Chicago" //Los_Angeles, New_York
      },
      "conferenceData": {
        "conferenceId": boothMeetingId,
        "conferenceSolution": {
          "key": {
            "type": "hangoutsMeet",
            "name": appointmentTitle
          }
        },
        "entryPoints": [ // An array of objects. It accepts one video type.
        {
          "entryPointType": "video",
          "label": boothMeetingLabel,
          "uri": boothMeetingUrl
        }],
      },
      // "conferenceDataVersion": 1,
      // "attachments":[
      //   {fileId: doctor.rddId, fileUrl: rddFolder.getUrl(), mimeType: rddFolder.getMimeType(), title: rddFolder.getName()}
      // ]
      "attendees": /*permanentBoothStaff.concat*/[{"email": dr.email}]
    }


    const args = {"conferenceDataVersion": 1, supportsAttachments: true };

    try {
        var response = Calendar.Events.insert(payload, boothappointment_calendarid, args)
        console.log(`Success! ${response}`)

        //CalendarApp.getCalendarById('primary').getEventById(appointment.getId()).deleteEvent();
        // Logger.log(boothCal.getName() + '\n' + boothCal.getEventById(response.id).getTitle());
        appointmentsList.push(new Appointment("Booth", dr, patient, patientPhone,boothCal.getEventById(response.id), boothMeetingUrl));
        if (!inDrList(dr.email, doctorsList)) {
          // Logger.log("Pushing " + dr.name + " to doctorsList");
          doctorsList.push(dr);
        } else {
          // Logger.log("Not pushing " + dr.email + " to doctorsList");
        }
        // appointment.deleteEvent();
    } catch(e) {
        console.log(`Oh no: ${e.message}`)
    }

    count++;

  })
  // console.log(count + " booth appointment events updated.")

  // Van appointments
/*  var vanCal = CalendarApp.getCalendarById(vanappointment_calendarid);
  var vanAppointmentsForDay = vanCal.getEventsForDay(today);

  count = 0;

  vanAppointmentsForDay.forEach(function(appointment) {
    
    var appointmentTitle = appointment.getTitle();
    var guests = appointment.getGuestList();
    var drGuest;
    guests.forEach(function(guest) {    // Doctor = calendar guest that isn't the calendar ID
      if (guest.getEmail() != vanappointment_calendarid && guest.getEmail() != endeavrPatient) {
        drGuest = guest;
      }
    })

    var dr = new Doctor(getNameFromTitle(appointmentTitle), drGuest.getEmail());

    var requestId = today + (count++); // used for van appointments

    var newStart = new Date(appointment.getStartTime());
    // newStart.setTime(newStart.getTime() + (60*60*1000));
    var newEnd = new Date(appointment.getEndTime());
    // newEnd.setTime(newEnd.getTime() + (60*60*1000));

    var payload = { 
      "summary": "ENDEAVRide Telemedicine Van Appointment - " + dr.getName(),
      "description": 'Scheduled Telemedicine Visit with ENDEAVRide Patient.\n\n'
                      + appointment.getDescription(),
       "sendUpdates": "none",
      "calendarId": vanappointment_calendarid,
      "end": {
        "dateTime": newEnd.toJSON(),  
        "timeZone": "America/Chicago"
      },
      "start": {
        "dateTime": newStart.toJSON(),
        "timeZone": "America/Chicago" //Los_Angeles, New_York
      },
      "conferenceData": {
        "createRequest": {
          "conferenceSolutionKey": {
            "type": "hangoutsMeet",
            "name": appointmentTitle
          },
          "requestId": "req" + requestId    //this needs to be unique on every request!
        }
      },
      // "conferenceDataVersion": 1,
      // "attachments":[
      //   {fileId: doctor.rddId, fileUrl: rddFolder.getUrl(), mimeType: rddFolder.getMimeType(), title: rddFolder.getName()}
      // ]
      "attendees": [{"email": dr.email},{"email": endeavrPatient}]
    }


    const args = {"conferenceDataVersion": 1, supportsAttachments: true };

    try {
        var response = Calendar.Events.insert(payload, vanappointment_calendarid, args)
        console.log(`Success! ${response}`)

        appointment.deleteEvent();
        CalendarApp.getCalendarById('primary').getEventById(appointment.getId()).deleteEvent();
        appointmentsList.push(new Appointment("Van", dr, vanCal.getEventById(response.id), response.conferenceData.entryPoints[0].uri));
        if (!inDrList(dr.email, doctorsList)) {
          Logger.log("Pushing " + dr.getName() + " to doctorsList");
          doctorsList.push(dr);
        }
    } catch(e) {
        console.log(`Oh no: ${e.message}`)
    }

    count++;

    
  })
  // console.log(count + " van appointment events updated.")
*/
  console.log(appointmentsList.length + " appointments for today");

  sendAppointmentEmails(doctorsList, appointmentsList);
}

function sendAppointmentEmails(doctors, appointments) {
  var blob = UrlFetchApp.fetch("https://i.postimg.cc/m2bXVsCY/ENDEAVR-main-logo.png").getBlob();
  var d = new Date().toLocaleDateString();
  doctors.forEach(function(doctor) {
    var htmlbody = createAppointmentHTMLBody(doctor, appointments);
    // Logger.log("Sending appointment email to:\n" + doctor.email);
    GmailApp.sendEmail(doctor.email, "ENDEAVR Telemedicine Appointments for " + d + " (PHI Enclosed)",
      createAppointmentTXTBody(doctor, appointments),
      {htmlBody: htmlbody, inlineImages: {image: blob}, name:'ENDEAVR Institute', cc:boothStaffGroup, bcc:endeavrEmail}
    );
  })
}

function createAppointmentHTMLBody(doctor, appointments) {
  var output = "<HTML><BODY><P style=\"font-family:'Times New Roman';font-size:18px\">"
  + "Hello " + doctor.getName() + ",<BR><BR>"
  + "Here is a list of all your ENDEAVR appointments for today:<BR><BR>"
  + getHTMLAppointmentsForDoctor(doctor, appointments)
  + "If you run into any problems, please call 1-844-ENDEAVR (363-3287).<BR><BR>"
  + htmlEmailSignature + "</P></BODY></HTML>";

  return output;
}

function createAppointmentTXTBody(doctor, appointments) {
  var output = "Hello " + doctor.getName() + ",\n\n"
  + "Here is a list of all your ENDEAVR appointments for today:\n\n"
  + getTXTAppointmentsForDoctor(doctor, appointments)
  + "If you run into any problems, please call 1-844-ENDEAVR (363-3287).\n\n"
  + "Thank you for your service!\nENDEAVR Telemedicine Team\n\n";

  return output;
}

function getHTMLAppointmentsForDoctor(dr, appointments) {
  var out = "";
  appointments.forEach(function(appointment) {
    // Logger.log(appointment.doctor.email + " == " + dr.email + " ?");
    if (appointment.doctor.email == dr.email) {
      out += appointment.htmlInfo() + "<BR>";
    }
  })
  return out;
}

function getTXTAppointmentsForDoctor(dr, appointments) {
  var out = "";
  appointments.forEach(function(appointment) {
    if (appointment.doctor.email == dr.email) {
      out += appointment.txtInfo() + "\n";
    }
  })
  return out;
}

function getPatientNameFromEvent(event) {
  var desc = event.getDescription();
  var patient;
  if (desc.search("Patient Phone #: ") == -1)
    patient = desc.substring(desc.indexOf('Patient Name: ')+14);
  else
    patient = desc.substring(desc.indexOf('Patient Name: ')+14, desc.indexOf('Patient Phone #: ')-1);
  // Logger.log('Patient = ' + patient);
  return patient;
}

function getPatientPhoneFromEvent(event) {
  var desc = event.getDescription();
  var patientNum;
  if (desc.search("Patient Phone #: ") == -1) {
    // Logger.log('Patient Phone not provided');
    return null;
  }
  patientNum = desc.substring(desc.indexOf('Patient Phone #: ')+17);
  // Logger.log('Patient Phone = ' + patientNum);
  return patientNum;
}

function getDoctorFromEvent(event) {
  var desc = event.getDescription();

  var email = desc.substring(desc.indexOf('EMAIL: ')+7, desc.indexOf('MOBILE: ')-1);
  var name = event.getTitle().substring(0, event.getTitle().indexOf('For Telemedicine Appointment')-1).trim();
  console.log(name + '\n' + email);

  return new Doctor(name, email);
}

