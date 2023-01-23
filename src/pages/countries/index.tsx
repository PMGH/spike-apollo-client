import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { FeaturedCountryProps, StaticCountriesListProps } from "types/countries.types";
import client from "../../../apollo/apollo-client";
import { useQuery } from "@apollo/client";
import { GET_COUNTRIES_QUERY, GET_COUNTRY_BY_ID_QUERY } from "apollo/queries";
import ClientOnly from "components/client-only";
import { Country } from "types/shared.types";

const StaticCountriesList = ({ countries }: StaticCountriesListProps) => {
  if (countries) {
    return (
      <ul>
        {countries.map(country => <li key={country.code}>{country.name}</li>)}
      </ul>
    )
  }
  return <p>Countries not found.</p>
}

const DynamicFeaturedCountry = ({ code }: FeaturedCountryProps) => {
  const { loading, data: dynamicData, error } = useQuery<{ country: Country }>(GET_COUNTRY_BY_ID_QUERY, { variables: { code } });

  console.log({ loading, dynamicData, error  })

  if (loading) {
    return <span>Loading...</span>
  }

  if (error) {
    return <span>Error: {error.message}</span>
  }

  if(dynamicData?.country) {
    return <p>Featured Country: {dynamicData?.country?.name}</p>
  }
  return null;
}

const CountriesPage = ({ countries: staticCountries }: any) => {
  console.log({ staticCountries })

  return (
    <>
    <h1>Countries Page</h1>
      <br />
      <ClientOnly>
        <ErrorBoundary fallback={<h2>Could not fetch featured country</h2>}>
          <Suspense fallback={<h1>Suspense fallback...</h1>}>
            <DynamicFeaturedCountry code="GE" />
          </Suspense>
        </ErrorBoundary>
      </ClientOnly>
      <br />
      <h3>Countries</h3>
      <StaticCountriesList countries={staticCountries} />
    </>
  )
}

export async function getStaticProps() {
  const { data } = await client.query({
    query: GET_COUNTRIES_QUERY
  });

  return {
    props: {
      countries: data.countries.slice(0, 4),
    },
  };
}

export default CountriesPage;
