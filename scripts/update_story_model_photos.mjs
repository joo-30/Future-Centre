import fs from 'fs';

const storyModelPath = 'server/src/models/story.model.ts';
let code = fs.readFileSync(storyModelPath, 'utf8');

// Replace green covers with authentic transformation photos
code = code.replace("imageUrl: '/stories/case_cover_nada.png',", "imageUrl: '/stories/transformation_107kg.jpg',");
code = code.replace("imageUrl: '/stories/case_cover_sameh.png',", "imageUrl: '/stories/transformation_sameh.jpg',");
code = code.replace("imageUrl: '/stories/case_cover_safia.png',", "imageUrl: '/stories/safia_with_dr.jpg',");

fs.writeFileSync(storyModelPath, code, 'utf8');
console.log('Updated story.model.ts with authentic photos');
