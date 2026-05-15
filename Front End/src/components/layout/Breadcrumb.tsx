import React from "react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <div className="breadcrumb-section">
      <div className="container">
        <div className="breadcrumb">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="separator">›</span>}
              {item.path ? (
                <Link to={item.path}>{item.label}</Link>
              ) : (
                <span className="current">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
