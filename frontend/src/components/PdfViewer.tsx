import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiMaximize,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";
import { Button, Skeleton } from "./ui";
import { cn } from "../lib/cn";

// Worker must be configured in the same module that renders <Document>/<Page>.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const MIN_SCALE = 0.4;
const MAX_SCALE = 3;
const SCALE_STEP = 0.2;

export function PdfViewer({
  url,
  onDownload,
}: {
  url: string;
  onDownload: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const visibility = useRef<Map<number, number>>(new Map());

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const [pageWidthPt, setPageWidthPt] = useState(0);
  const [scale, setScale] = useState(1);
  const [autoFit, setAutoFit] = useState(true);
  const [error, setError] = useState(false);

  // Track available width for fit-to-width rendering.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setContainerWidth(width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Keep the PDF fitting the container width until the user manually zooms.
  useEffect(() => {
    if (autoFit && containerWidth > 0 && pageWidthPt > 0) {
      setScale((containerWidth - 32) / pageWidthPt);
    }
  }, [autoFit, containerWidth, pageWidthPt]);

  const options = useMemo(() => ({}), []);

  const handleLoadSuccess = useCallback((pdf: { numPages: number }) => {
    setNumPages(pdf.numPages);
    setError(false);
    pageRefs.current = new Array(pdf.numPages).fill(null);
  }, []);

  const handleFirstPageLoad = useCallback((page: { originalWidth: number }) => {
    setPageWidthPt(page.originalWidth);
  }, []);

  // Observe which page is most visible to drive the page indicator.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || numPages === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.pageIndex);
          visibility.current.set(index, entry.intersectionRatio);
        }
        let best = 0;
        let bestRatio = -1;
        visibility.current.forEach((ratio, index) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = index;
          }
        });
        setCurrentPage(best + 1);
      },
      { root, threshold: [0.1, 0.25, 0.5, 0.75, 1] },
    );

    pageRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [numPages, scale]);

  function goToPage(page: number) {
    const target = Math.min(Math.max(page, 1), numPages);
    pageRefs.current[target - 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function zoomIn() {
    setAutoFit(false);
    setScale((prev) => Math.min(prev + SCALE_STEP, MAX_SCALE));
  }

  function zoomOut() {
    setAutoFit(false);
    setScale((prev) => Math.max(prev - SCALE_STEP, MIN_SCALE));
  }

  function resetZoom() {
    setAutoFit(false);
    setScale(1);
  }

  function fitWidth() {
    setAutoFit(true);
  }

  return (
    <div ref={containerRef} className="glass flex flex-col overflow-hidden rounded-2xl">
      {/* Sticky toolbar */}
      <div className="glass-header sticky top-16 z-10 flex items-center gap-2 overflow-x-auto px-3 py-2.5">
        <div className="flex items-center gap-1">
          <ToolbarButton onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1} label="Previous page">
            <FiChevronLeft className="h-4 w-4" />
          </ToolbarButton>
          <span className="whitespace-nowrap px-1 text-sm font-medium tabular-nums text-slate-600 dark:text-slate-300">
            {numPages ? `${currentPage} / ${numPages}` : "–"}
          </span>
          <ToolbarButton
            onClick={() => goToPage(currentPage + 1)}
            disabled={numPages === 0 || currentPage >= numPages}
            label="Next page"
          >
            <FiChevronRight className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="mx-1 hidden h-6 w-px shrink-0 bg-slate-300/60 dark:bg-white/10 sm:block" />

        <div className="flex items-center gap-1">
          <ToolbarButton onClick={zoomOut} disabled={scale <= MIN_SCALE} label="Zoom out">
            <FiZoomOut className="h-4 w-4" />
          </ToolbarButton>
          <button
            type="button"
            onClick={resetZoom}
            className="min-w-[3.5rem] whitespace-nowrap rounded-lg px-2 py-1 text-sm font-medium tabular-nums text-slate-600 transition-colors hover:bg-slate-500/10 dark:text-slate-300"
            title="Reset zoom to 100%"
          >
            {Math.round(scale * 100)}%
          </button>
          <ToolbarButton onClick={zoomIn} disabled={scale >= MAX_SCALE} label="Zoom in">
            <FiZoomIn className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="mx-1 hidden h-6 w-px shrink-0 bg-slate-300/60 dark:bg-white/10 sm:block" />

        <ToolbarButton onClick={fitWidth} active={autoFit} label="Fit width">
          <FiMaximize className="h-4 w-4" />
        </ToolbarButton>

        <button
          type="button"
          onClick={onDownload}
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-500/10 dark:text-indigo-400"
        >
          <FiDownload className="h-4 w-4" />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>

      {/* Document scroll area */}
      <div
        ref={scrollRef}
        className="max-h-[calc(100vh-11rem)] min-h-[28rem] overflow-auto bg-slate-100/70 p-4 dark:bg-black/20"
      >
        {error ? (
          <PdfError onDownload={onDownload} />
        ) : (
          <Document
            file={url}
            options={options}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={() => setError(true)}
            onSourceError={() => setError(true)}
            loading={<PdfLoading />}
            error={<PdfError onDownload={onDownload} />}
            noData={<PdfEmpty />}
            className="flex flex-col items-center gap-4"
          >
            {Array.from({ length: numPages }, (_, index) => (
              <div
                key={index}
                data-page-index={index}
                ref={(node) => {
                  pageRefs.current[index] = node;
                }}
                className="overflow-hidden rounded-lg bg-white shadow-soft"
              >
                <Page
                  pageNumber={index + 1}
                  scale={scale}
                  onLoadSuccess={index === 0 ? handleFirstPageLoad : undefined}
                  loading={<Skeleton className="h-[60vh] w-full" />}
                  renderTextLayer
                  renderAnnotationLayer
                />
              </div>
            ))}
          </Document>
        )}
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  disabled,
  active,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-500/10 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300",
        active && "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
      )}
    >
      {children}
    </button>
  );
}

function PdfLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 py-4">
      <Skeleton className="mx-auto h-[70vh] w-full" />
    </div>
  );
}

function PdfEmpty() {
  return (
    <div className="flex min-h-[24rem] items-center justify-center text-sm text-slate-500 dark:text-slate-400">
      No PDF data to display.
    </div>
  );
}

function PdfError({ onDownload }: { onDownload: () => void }) {
  return (
    <div className="flex min-h-[24rem] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10">
        <FiAlertTriangle className="h-8 w-8 text-amber-500" />
      </span>
      <h3 className="mt-5 font-display text-lg font-bold text-slate-900 dark:text-white">
        Couldn&apos;t display this PDF
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        The preview failed to load. You can still download the file to view it on your device.
      </p>
      <Button onClick={onDownload} className="mt-6">
        <FiDownload className="h-4 w-4" />
        Download file
      </Button>
    </div>
  );
}
