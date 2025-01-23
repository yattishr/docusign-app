import { useEffect, useState } from 'react';
import { Template, TemplatesResponse } from '@/types';

const TemplatesList = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/list-templates');
        const data = await response.json();
        setTemplates(data.envelopeTemplates); // Ensure you are accessing the correct property
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Templates</h1>
      <ul>
        {templates.map((template) => (
          <li key={template.templateId}>{template.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default TemplatesList;