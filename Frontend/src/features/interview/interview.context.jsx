import { createContext, useState } from "react";

export const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [stagedResumeFile, setStagedResumeFile] = useState(null);

  return (
    <InterviewContext.Provider
      value={{
        loading,
        setLoading,
        report,
        setReport,
        reports,
        setReports,
        pagination,
        setPagination,
        stagedResumeFile,
        setStagedResumeFile,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};
