import * as React from 'react';
import HomeFeature from '../features/HomeFeature';
import Head from 'next/head';

export default function IndexView() {
  return <>
    <Head>
      <title>AdrianTodt</title>
    </Head>
    <HomeFeature/>
  </>;
}
