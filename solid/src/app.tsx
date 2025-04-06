import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import Layout from "~/components/Layout";

export default function App() {
  return (
    <Router
      root={props => (
        <MetaProvider>
          <Title>SolidStart - Basic</Title>
          <Layout>
            <Suspense>{props.children}</Suspense>
          </Layout>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
