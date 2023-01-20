import { gql } from "@apollo/client";

export const GET_COUNTRIES_QUERY = gql`
  query {
    countries {
      code
      name
      emoji
    }
  }
`;

export const GET_COUNTRY_BY_ID_QUERY = gql`
  query($code: ID!) {
    country(code: $code) {
      code
      name
      emoji
    }
  }
`
