import Layout from "../components/layout";
import Link from "next/link";

export default function Custom404() {
  return (
    <Layout>
      <h1>404 - Page Not Found </h1>
      <Link href='./'> Back to Home </Link>
    </Layout>
  )
}