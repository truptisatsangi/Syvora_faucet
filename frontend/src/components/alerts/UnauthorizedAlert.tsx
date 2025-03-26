import React from "react";
import { Alert, AlertDescription } from "../../components/ui/alert";

const UnauthorizedAlert = () => (
  <Alert variant="destructive">
    <AlertDescription>
      You are not authorized to access this page.
    </AlertDescription>
  </Alert>
);

export default UnauthorizedAlert;
