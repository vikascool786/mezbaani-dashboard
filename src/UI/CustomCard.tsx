import React from "react";
import { Card } from "react-bootstrap";
import "./CustomCard.css";

interface CustomCardProps {
  bgColor: string;
  title: string;
  description?: string;
  onClick?: () => void;
}

const CustomCard: React.FC<CustomCardProps> = ({ 
  bgColor,
  title,
  description,
  onClick, 
}) => {
  return (
    <Card className="custom-card mb-2" style={{ backgroundColor: bgColor }}>
      {/* Optional Top Content */}
      <div className="align-items-center custom-card-top d-flex justify-content-center text-center w-100" onClick={onClick}>
       {title} {description}
      </div>

      {/* Bottom Icons */}
      <div className="custom-card-icons position-absolute" style={{bottom: '-17px'}}>
        <i className="bi bi-printer icon-bg"></i>
        <i className="bi bi-eye icon-bg"></i>
      </div>
    </Card>
  );
};

export default CustomCard;
