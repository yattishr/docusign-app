import { useEffect, useState } from 'react';
import { Template, TemplatesResponse } from '@/types';
import { useLocalStorage } from 'usehooks-ts';
import { listTemplates } from '@/lib/docusign';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const TemplatesList = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [docusignAccessToken] = useLocalStorage('docusignAccessToken', '');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await listTemplates(docusignAccessToken);
        // const data = await response.json();
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
    <div className='max-w-full overflow-y-scroll max-h-[calc(100vh-120px)]'>
      <div className='flex flex-col gap-2 p-4 pt-0'>
        {templates.map(template => (
          <button key={template.templateId} className={cn("flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all relative")}>
            <div className='flex flex-col w-full gap-2'>
              <div className='flex items-center'>
                <div className='flex items-center gap-2'>
                  <div className='font-semibold'>
                    {template.name}
                  </div>
                </div>
                <div className={cn("ml-auto text-xs")}>
                  {new Date(template.created).toLocaleDateString()}
                </div>
              </div>
              <div className='text-xs font-medium'>
                {template.description}
              </div>
            </div>
            <div className='text-xs line-clamp-2 text-muted-foreground'>
              {template.emailSubject}
            </div>
            {template.folderName && (
              <div className='flex items-center gap-2'>
                <Badge className='text-xs font-medium' variant='default'>
                  {template.folderName}
                </Badge>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

};

export default TemplatesList;