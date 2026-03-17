// ============================================================
//  demo-data.js — Dữ liệu mẫu / fallback khi không kết nối được Google Sheet
//  Chỉnh sửa file này để thay đổi bài kiểm tra demo
// ============================================================

const IMG = {
  sky:   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  world: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1200px-World_map_-_low_resolution.svg.png',
  solar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Solar-System.pdf/page1-1200px-Solar-System.pdf.jpg',
  cell:  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Animal_cell_structure_en.svg/1200px-Animal_cell_structure_en.svg.png',
  code:  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
};

const DEMO_TESTS = [
  { id:1, title:'General Knowledge', description:'Mixed types incl. image, hotspot & matrix', icon:'🧠', sheet:'demo_gen',    duration:'6 min',  difficulty:'Medium', color:'#7c6af7' },
  { id:2, title:'Science Quiz',      description:'Planets, cells & drag-drop',                icon:'🔬', sheet:'demo_sci',    duration:'8 min',  difficulty:'Medium', color:'#f76a8a' },
  { id:3, title:'Tech & Coding',     description:'Web & programming fundamentals',             icon:'💻', sheet:'demo_tech',   duration:'10 min', difficulty:'Hard',   color:'#6af7c4' },
  { id:4, title:'Feedback Survey',   description:'Share your experience — no right/wrong',     icon:'📋', sheet:'demo_survey', duration:'3 min',  difficulty:'Easy',   color:'#fbbf24' },
];

const DEMO_QS = {
  demo_gen: [
    { id:1, question:'What type of landscape is shown in this photo?',   type:'radio',    imageUrl:IMG.sky,   options:'Desert|Mountain|Ocean|Forest',                                                                                    correct:'Mountain',                                                                required:'TRUE'  },
    { id:2, question:'Which of these are mammals?',                       type:'checkbox', options:'Dog|Eagle|Whale|Snake|Cat',                                                                                                          correct:'Dog|Whale|Cat',                                                           required:'TRUE'  },
    { id:3, question:'Mark each statement as True or False:',             type:'mtf',      options:'The sun is a star|Water boils at 50°C|Sound travels faster than light|DNA has a double helix structure',                            correct:'TRUE|FALSE|FALSE|TRUE',                                                    required:'TRUE'  },
    { id:4, question:'The Earth revolves around the Sun.',                type:'truefalse',options:'',                                                                                                                                   correct:'TRUE',                                                                    required:'TRUE'  },
    { id:5, question:'Click on Europe in the map below:',                 type:'hotspot',  imageUrl:IMG.world, options:'Europe:28%,15%,20%,25%|Asia:50%,12%,35%,38%|Americas:5%,10%,22%,55%|Africa:30%,38%,20%,30%|Australia:65%,55%,18%,22%', correct:'Europe',                                                             required:'TRUE'  },
    { id:6, question:'Rate your confidence in each subject:',             type:'matrix',   options:'Mathematics|Science|History|Literature',                  matrixCols:'Not at all|Slightly|Moderately|Very|Extremely',              correct:'',                                                                        required:'FALSE' },
    { id:7, question:'Drag to put in order from smallest to largest:',    type:'ordering', options:'Ant|Mouse|Cat|Horse|Elephant',                                                                                                       correct:'Ant|Mouse|Cat|Horse|Elephant',                                            required:'TRUE'  },
    { id:8, question:'Match each country to its capital:',                type:'matching', options:'France::Paris|Japan::Tokyo|Brazil::Brasília|Australia::Canberra',                                                                   correct:'France::Paris|Japan::Tokyo|Brazil::Brasília|Australia::Canberra',         required:'TRUE'  },
    { id:9, question:'How fun was this quiz?',                            type:'rating',   options:'', ratingMin:'Boring', ratingMax:'Super fun', ratingScale:5,                                                                        correct:'',                                                                        required:'TRUE'  },
  ],
  demo_sci: [
    { id:1, question:'Chemical symbol for water?',                             type:'radio',    options:'WA|H2O|HO2|W',                                                                                                correct:'H2O',                                                         required:'TRUE' },
    { id:2, question:'Click on the nucleus in this animal cell diagram:',      type:'hotspot',  imageUrl:IMG.cell, options:'Nucleus:38%,35%,22%,25%|Mitochondria:62%,52%,18%,18%|Cell Membrane:5%,5%,90%,90%|Cytoplasm:15%,15%,70%,70%', correct:'Nucleus',                                              required:'TRUE' },
    { id:3, question:'Classify each organism into its correct kingdom:',       type:'matrix',   options:'Mushroom|Eagle|Oak Tree|E. coli',                      matrixCols:'Animal|Plant|Fungi|Bacteria',              correct:'Mushroom::Fungi|Eagle::Animal|Oak Tree::Plant|E. coli::Bacteria', required:'TRUE' },
    { id:4, question:'True or False for each science fact:',                   type:'mtf',      options:'The heart pumps blood|Plants absorb CO₂|The moon has an atmosphere|Sound cannot travel in space',            correct:'TRUE|TRUE|FALSE|TRUE',                                         required:'TRUE' },
    { id:5, question:'Order the planets closest to farthest from the Sun:',    type:'ordering', imageUrl:IMG.solar, options:'Mercury|Venus|Earth|Mars|Jupiter|Saturn',                                                  correct:'Mercury|Venus|Earth|Mars|Jupiter|Saturn',                     required:'TRUE' },
    { id:6, question:'Light travels faster than sound.',                        type:'truefalse',options:'',                                                                                                            correct:'TRUE',                                                        required:'TRUE' },
  ],
  demo_tech: [
    { id:1, question:'What does this code snippet primarily do?',               type:'radio',    imageUrl:IMG.code, options:'Defines a function|Creates a loop|Declares a variable|Imports a module',                                    correct:'Defines a function',                                              required:'TRUE' },
    { id:2, question:'Which are JavaScript frameworks?',                         type:'checkbox', options:'React|Vue|Django|Angular|Laravel',                                                                              correct:'React|Vue|Angular',                                               required:'TRUE' },
    { id:3, question:'Match each concept to its correct category:',              type:'matrix',   options:'React|SQL|Git|Docker', matrixCols:'Frontend|Backend|Database|DevOps|Version Control',                        correct:'React::Frontend|SQL::Database|Git::Version Control|Docker::DevOps', required:'TRUE' },
    { id:4, question:'True or False — web fundamentals:',                        type:'mtf',      options:'HTML defines structure|CSS handles logic|JavaScript is synchronous by default|REST uses HTTP',                correct:'TRUE|FALSE|FALSE|TRUE',                                           required:'TRUE' },
    { id:5, question:'Order from lowest to highest abstraction:',                type:'ordering', options:'Machine Code|Assembly|C|Python|No-Code',                                                                      correct:'Machine Code|Assembly|C|Python|No-Code',                          required:'TRUE' },
    { id:6, question:'HTML stands for HyperText Markup Language.',               type:'truefalse',options:'',                                                                                                            correct:'TRUE',                                                           required:'TRUE' },
  ],
  demo_survey: [
    { id:1, question:'How did you hear about us?',                type:'dropdown', options:'Social Media|Friend|Google|Other',                                                                                                          correct:'', required:'TRUE'  },
    { id:2, question:'How satisfied are you with each feature?',  type:'matrix',   options:'Quiz Questions|Score System|Drag & Drop|Hotspot Images|Matrix Questions', matrixCols:'Very Unsatisfied|Unsatisfied|Neutral|Satisfied|Very Satisfied', correct:'', required:'FALSE' },
    { id:3, question:'Any suggestions for improvement?',          type:'text',     options:'',                                                                                                                                          correct:'', required:'FALSE' },
    { id:4, question:'Rate your overall experience.',             type:'rating',   options:'', ratingMin:'Poor', ratingMax:'Excellent', ratingScale:5,                                                                                  correct:'', required:'TRUE'  },
  ],
};
