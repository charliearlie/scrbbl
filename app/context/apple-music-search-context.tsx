import { PropsWithChildren, createContext, useContext, useState } from "react";

const AppleMusicSearchContext = createContext<{
  searchResults: any;
  handleSearchResults: any;
} | null>(null);

export const useAlbumSearch = () => {
  const context = useContext(AppleMusicSearchContext);
  if (!context) {
    throw new Error(
      "useAlbumSearch must be used within an AlbumSearchProvider"
    );
  }
  return context;
};

export const AlbumSearchProvider = ({ children }: PropsWithChildren) => {
  const [searchResults, setSearchResults] = useState(null);

  const handleSearchResults = (results: any) => {
    setSearchResults(results);
  };

  return (
    <AppleMusicSearchContext.Provider
      value={{ searchResults, handleSearchResults }}
    >
      {children}
    </AppleMusicSearchContext.Provider>
  );
};
