import { createContext, useContext, useState } from "react";

type TrackerContextType = {
	data?: string;
	setData?: React.Dispatch<React.SetStateAction<string | undefined>>;
};
const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export const TrackerContextProvider = ({ children }: { children: React.ReactNode }) => {
	const [data, setData] = useState<string | undefined>(undefined);
	return <TrackerContext.Provider value={{ data, setData }}>{children}</TrackerContext.Provider>;
};

export const useTrackerContext = () => {
	const context = useContext(TrackerContext);
	if (context === undefined) {
		throw new Error("useTracker must be used within a TrackerContextProvider");
	}
	return context;
};
