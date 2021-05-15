// Doctor classes used to store info about each ENDEAVR doctor

const drwong = new EndeavrDoctor({
  name:'Timothy Wong', 
  email:'thwong@ihealth.clinic', 
  destinationUrl:'https://docs.google.com/spreadsheets/d/1_zoAkD7FvOGkiLZqOp4ghUd5xg5jIEZOZQoWr2GCl_U/edit?usp=sharing',
  rddUrl:'https://drive.google.com/drive/folders/1dG2oi6rOHJSZz1J8iiWGk1Z0VQFODWhH?usp=sharing',
  destinationId:'1_zoAkD7FvOGkiLZqOp4ghUd5xg5jIEZOZQoWr2GCl_U',
  rddId:'1dG2oi6rOHJSZz1J8iiWGk1Z0VQFODWhH'
  });

const drcolon = new EndeavrDoctor({
  name:'Hector Colon', 
  email:'drcolon@endeavr.city', 
  destinationUrl:'https://docs.google.com/spreadsheets/d/1RrRtxDHAhi4lOh1OugugXwIr5pzT5RY0d3JJwIfvL5o/edit?usp=sharing',
  rddUrl:'https://drive.google.com/drive/folders/10DzuXKihazo-oq0Cs-ccHHhD2bDFniIu?usp=sharing',
  destinationId:'1RrRtxDHAhi4lOh1OugugXwIr5pzT5RY0d3JJwIfvL5o',
  rddId:'10DzuXKihazo-oq0Cs-ccHHhD2bDFniIu'
  });

// Default doctor value for testing
const kunal = new EndeavrDoctor({
  name:'Kunal Gupta', 
  email:'kgupta@endeavr.city', 
  destinationUrl:'https://docs.google.com/spreadsheets/d/1AbRpmvtk4WeUxwo4-3IR0EHUKo4CHMNY8fLK7N-KGMk/edit?usp=sharing',
  rddUrl:'https://drive.google.com/drive/folders/1kltR_6r3FZ_9cnBKlKMbwXCBdS8ePYXH?usp=sharing',
  destinationId:'1AbRpmvtk4WeUxwo4-3IR0EHUKo4CHMNY8fLK7N-KGMk',
  rddId:'1kltR_6r3FZ_9cnBKlKMbwXCBdS8ePYXH'
  });

var doctor = kunal;
