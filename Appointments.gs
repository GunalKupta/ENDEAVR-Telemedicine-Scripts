let appointment_calendarid = "c_kn31ueqjd4kdpno7ctlh4qob58@group.calendar.google.com";


function updateAppointmentsForDay() {
  var today = new Date();
  var appointmentsForDay = CalendarApp.getCalendarById(appointment_calendarid).getEventsForDay(today);

  console.log("There is/are " + appointmentsForDay.length + " scheduled Doctor's appointment(s) today");

  boothMeetingUrl = getBoothMeetingUrl();
  boothMeetingId = boothMeetingUrl.substring(24);
  boothMeetingLabel = boothMeetingUrl.substring(8);
  var count = 0;

  appointmentsForDay.forEach(function(appointment) {
    
    var appointmentTitle = appointment.getTitle();

    chooseDoctor(appointmentTitle);
    var rddFolder = DriveApp.getFileById(doctor.rddId);

    var payload = { 
      "description": appointment.getDescription() + '\n\nScheduled Telemedicine Visit with ENDEAVR Patient.\nCheck email for more information.\n'
                      + 'While you are seeing the patient, you can perform remote diagnostics using ENDEAVR devices such as the digital throatscope, otoscope  and stethoscope. These data can be accessed instantly during the session from the following link:\n' + doctor.rddUrl,
                    "sendUpdates": "all",
                    "calendarId": appointment_calendarid,
                    "end": {
                      "dateTime": appointment.getEndTime().toJSON(),  
                      "timeZone": "America/Chicago"
                    },
                    "start": {
                      "dateTime": appointment.getStartTime().toJSON(),
                      "timeZone": "America/Chicago" //Los_Angeles, New_York
                    },
//                    "conferenceDataVersion": 1,
                    "attachments":[
                      {fileId: doctor.rddId, fileUrl: rddFolder.getUrl(), mimeType: rddFolder.getMimeType(), title: rddFolder.getName()}
                    ]
                }

    var requestId = today + (count++);

    if (appointmentTitle.includes('Van')) {         // Create new Google Meet meeting if van appointment
      payload.conferenceData = {"createRequest": {
                    "conferenceSolutionKey": {
                      "type": "hangoutsMeet"
                    },
                    "requestId": "req" + requestId    //this needs to be unique on every request!
                  }};
      payload.attendees = [{"email": doctor.email},{"email": endeavrPatient}];
      payload.summary = "ENDEAVRide Telemedicine Van Appointment - " + doctor.name;
    } else if (appointmentTitle.includes('Booth')) {        // Use Booth Google Meet meeting if booth appointment
      payload.conferenceData = {
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
                  };
      payload.attendees = permanentBoothStaff.concat({"email": doctor.email});
      payload.summary = "ENDEAVR Telemedicine Booth Appointment - " + doctor.name;
    }

    const args = {"conferenceDataVersion": 1, supportsAttachments: true };

    try {
        const response = Calendar.Events.insert(payload, appointment_calendarid, args)
        console.log(`Success! ${response}`)

        appointment.deleteEvent();
    } catch(e) {
        console.log(`Oh no: ${e.message}`)
    }

  })
  console.log(count + " appointment events updated.")
}
