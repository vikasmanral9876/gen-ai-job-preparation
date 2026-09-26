import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, deleteInterviewReport } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const {
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
    } = context;

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response?.interviewReport)
            return response?.interviewReport
        } catch (error) {
            console.error("Error generating interview report:", error)
            const rawMsg =
              error?.response?.data?.message ||
              error?.message ||
              ""
            const isGeminiDemand =
              rawMsg.toLowerCase().includes("gemini") ||
              rawMsg.toLowerCase().includes("demand") ||
              rawMsg.toLowerCase().includes("overloaded") ||
              rawMsg.toLowerCase().includes("503") ||
              rawMsg.toLowerCase().includes("429") ||
              rawMsg.toLowerCase().includes("temporarily unavailable") ||
              rawMsg.toLowerCase().includes("quota") ||
              rawMsg.toLowerCase().includes("resource_exhausted")

            if (isGeminiDemand) {
              const friendlyError = new Error("We couldn't generate your interview. Please try again.")
              friendlyError.response = {
                data: {
                  message: "We couldn't generate your interview. Please try again.",
                },
              }
              throw friendlyError
            }
            throw error
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (id) => {
        const targetId = id || interviewId
        if (!targetId) return null
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(targetId)
            if (response?.interviewReport) {
                setReport(response.interviewReport)
            }
        } catch (error) {
            console.error("Error fetching interview report:", error)
        } finally {
            setLoading(false)
        }
        return response?.interviewReport
    }

    const getReports = async ({ page, limit } = {}) => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports({ page, limit })
            if (response?.interviewReports) {
                setReports(response.interviewReports)
            }
            if (response?.pagination) {
                setPagination(response.pagination)
            }
        } catch (error) {
            console.error("Error fetching reports:", error)
        } finally {
            setLoading(false)
        }

        return response
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            setTimeout(() => window.URL.revokeObjectURL(url), 1000)
            return response
        }
        catch (error) {
            console.error("Error generating resume PDF:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const deleteReport = async (id) => {
        const targetId = id || interviewId;
        if (!targetId) return false;
        try {
            await deleteInterviewReport(targetId);
            setReports((prev) => prev.filter((r) => r._id !== targetId));
            if (report && report._id === targetId) {
                setReport(null);
            }
            try {
                localStorage.removeItem(`hirepilot_prep_${targetId}`);
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith("hirepilot_prep_") && key.endsWith(targetId)) {
                        localStorage.removeItem(key);
                    }
                }
            } catch (e) {
                console.error("Failed to clear prep checklist:", e);
            }
            return true;
        } catch (error) {
            console.error("Error deleting report:", error);
            throw error;
        }
    };

    useEffect(() => {
        if (interviewId) {
            if (!report || report._id !== interviewId) {
                getReportById(interviewId)
            }
        }
    }, [ interviewId ])

    return {
      loading,
      report,
      reports,
      pagination,
      generateReport,
      getReportById,
      getReports,
      getResumePdf,
      deleteReport,
      stagedResumeFile,
      setStagedResumeFile,
    };

}