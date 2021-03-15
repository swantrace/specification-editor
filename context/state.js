import { createContext, useContext } from 'react';
import PropTypes from 'prop-types';

const AppContext = createContext();

export function AppWrapper({ children, ...rest }) {
  const sharedState = {};

  return (
    <AppContext.Provider value={{ ...rest, ...sharedState }}>
      {children}
    </AppContext.Provider>
  );
}

AppWrapper.propTypes = {
  children: PropTypes.node,
};

export function useAppContext() {
  return useContext(AppContext);
}
