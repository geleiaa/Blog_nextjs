import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
//import remarkGfm from 'remark-gfm';
//import { remark } from 'remark';
//import html from 'remark-html';
//import remarkFrontmatter from 'remark-frontmatter';
import Showdown from 'showdown';

const postsDirectory = path.join(process.cwd(), 'posts'); // path local da app

//analize e rend markdown
export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...matterResult.data,
    };
  });
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

// return lista de nomes dos arquivos em ./posts 
export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

//return os dados com base no id
export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section

  // Remark removed, now using Showdowm
  const matterResult = matter(fileContents);

  const converter = new Showdown.Converter();

  const contentHtml = converter.makeHtml(matterResult.content);
  
  // Combine the data with the id and contentHtml

  // Combine the data with the id
  return {
    id,
    contentHtml,
    ...matterResult.data,
  };
}

// Use remark to convert markdown into HTML string
//const processedContent = await remark()
//  .use(html)
//  .use(remarkGfm)
//  .use(remarkFrontmatter)
//  .use(remarkLintCodeBlockStyle)
//  .use(remarkPresetLintConsistent)
//  .use(remarkPresetLintRecommended)
//  .process(matterResult.content) 
//const contentHtml = processedContent.toString();
//console.log('=>', reporter(processedContent, ['color', 'verbose']));
