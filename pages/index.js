import Head from 'next/head';
import Image from 'next/image';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import Link from 'next/link';
import Date from '../components/date';
import { getSortedPostsData } from '../lib/posts';


export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

export default function Home({ allPostsData }) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section>
        <p>
          Olá, me chamo Guilherme, sou desenvolvedor web junior e
          apaixonado por tecnologia. Nesse blog vou postar alguns
          artigos sobre desenvolvimento web e segurança/hacking
          com o objetivo de aprender mais e também usar esse blog como portfólio.
        </p>
        <p>
          Me siga no: &nbsp;&nbsp;
          <Image
            src="/images/github-mark-white.svg"
            className={utilStyles.borderCircle}
            height={20}
            width={20} /><a href="https://github.com/geleiaa" target="_blank">Github</a>
            &nbsp;&nbsp;&nbsp;&nbsp;
          <Image
            src="/images/In-White-21.png"
            className={utilStyles.borderCircle}
            height={20}
            width={20} /><a href="https://www.linkedin.com/in/guilherme-ferreira-48b135247/" target="_blank">Linkedin</a>
        </p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Artigos</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title, description }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/posts/${id}`}>{title}</Link>
              <br />
              <small>
                <p className={utilStyles.descrText}>
                  {description}
                </p>
              </small>
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}
