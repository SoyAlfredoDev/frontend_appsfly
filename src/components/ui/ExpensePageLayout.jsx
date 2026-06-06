import { motion as Motion } from "framer-motion";
import PageContainer, { PageHeader } from "../layout/PageContainer.jsx";
import {
  containerVariants,
  itemVariants,
} from "../../utils/expenseUiPatterns.js";

/**
 * Shell de página alineado a /expenses — PageContainer + animación + PageHeader.
 */
export default function ExpensePageLayout({
  title,
  subtitle,
  actions,
  children,
  className = "",
}) {
  return (
    <PageContainer className={className}>
      <Motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <PageHeader title={title} subtitle={subtitle} actions={actions} />
        {children}
      </Motion.div>
    </PageContainer>
  );
}

export function ExpenseAnimatedSection({ children, className = "" }) {
  return (
    <Motion.div variants={itemVariants} className={className}>
      {children}
    </Motion.div>
  );
}
