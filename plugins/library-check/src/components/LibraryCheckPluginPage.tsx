import Grid from '@material-ui/core/Grid';
import React, { useState } from 'react';
import {
  SupportButton,
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  HeaderTabs,
  Page,
} from '@backstage/core-components';
import { LibrariesByLanguageCardComponent } from './LibrariesByLanguageCardComponent';
import { TotalLibrariesCardComponent } from './TotalLibrariesCardComponent';
import { LanguagesDistributionCardComponent } from './LanguagesDistributionCardComponent';
import TopEntitiesByImpactCardComponent from './TopEntitiesByImpactCardComponent';

export default {
  title: 'Plugins/LibraryCheck',
  component: Page,
};

const tabs = [{ label: 'Overview' }];

const PageBody = () => (
  <Grid container>
    <Grid item xs container alignItems="flex-start">
      <Grid item xs={12} md={6}>
        <LibrariesByLanguageCardComponent />
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
        container
        spacing={2}
        direction="row"
        alignItems="stretch"
        justifyContent="space-between"
      >
        <Grid item xs={12} md={12}>
          <TotalLibrariesCardComponent />
        </Grid>
        <Grid item xs={12} md={12}>
          <LanguagesDistributionCardComponent />
        </Grid>
        <Grid item xs={12} md={12}>
          <TopEntitiesByImpactCardComponent />
        </Grid>
      </Grid>
    </Grid>
  </Grid>
);

const PageHeader = () => (
  <Header
    title="Library Check"
    subtitle="This plugin helps you to check the status of a library used by an entity."
  >
    <HeaderLabel label="Owner" value="@anakz" />
    <HeaderLabel label="Lifecycle" value="Beta" />
  </Header>
);

const PageTabContent = ({ selectedTab }: { selectedTab?: number }) => (
  <ContentHeader
    title={selectedTab !== undefined ? tabs[selectedTab].label : 'Header'}
  >
    <SupportButton>
      This Plugin is an example. This text could provide useful information for
      the user.
    </SupportButton>
  </ContentHeader>
);

export const LibraryCheckPluginPage = () => {
  const [selectedTab, setSelectedTab] = useState<number>(0);

  return (
    <Page themeId="tool">
      <PageHeader />
      <HeaderTabs
        selectedIndex={selectedTab}
        onChange={index => setSelectedTab(index)}
        tabs={tabs.map(({ label }, index) => ({
          id: index.toString(),
          label,
        }))}
      />
      <Content>
        <PageTabContent selectedTab={selectedTab} />
        <PageBody />
      </Content>
    </Page>
  );
};
